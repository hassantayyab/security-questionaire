"""
Questionnaire management and AI answer generation endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Dict, Any, List
from pydantic import BaseModel
import asyncio

from app.services.ai_service import AIService
from app.services.database import DatabaseService
from app.config.settings import get_settings, Settings

router = APIRouter()

class AnswerUpdate(BaseModel):
    answer: str
    status: str = "unapproved"

# Background task for generating answers
async def generate_answers_background(
    questionnaire_id: str,
    supabase_url: str,
    supabase_key: str,
    anthropic_api_key: str
):
    """
    Background task to generate AI answers for all questions in a questionnaire
    """
    try:
        db_service = DatabaseService(
            supabase_url=supabase_url,
            supabase_key=supabase_key
        )
        ai_service = AIService(anthropic_api_key)
        
        # Get questions for the questionnaire
        questions = await db_service.get_questions_by_questionnaire(questionnaire_id)
        
        if not questions:
            return
        
        # Get all policy documents text
        policies = await db_service.get_all_policies()
        policy_context = "\n\n".join([p.get("extracted_text", "") for p in policies if p.get("extracted_text")])
        
        if not policy_context:
            return
        
        # Generate answers for each question
        for question in questions:
            try:
                answer = await ai_service.generate_answer(
                    question["question_text"], 
                    policy_context
                )
                
                # Update question with generated answer
                await db_service.update_question_answer(
                    question["id"], 
                    answer, 
                    status="unapproved"
                )
                
                # Small delay to prevent overwhelming the API
                await asyncio.sleep(0.5)
                
            except Exception as e:
                print(f"Error generating answer for question {question['id']}: {str(e)}")
                continue
                
    except Exception as e:
        print(f"Background task error: {str(e)}")

class BulkApproval(BaseModel):
    question_ids: List[str]
    status: str

@router.get("/")
async def get_questionnaires(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """Get all questionnaires"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        questionnaires = await db_service.get_all_questionnaires()
        
        return {
            "success": True,
            "questionnaires": questionnaires
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching questionnaires: {str(e)}")

@router.get("/policies")
async def get_policies(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """Get all uploaded PDF policies"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        policies = await db_service.get_all_policies()
        
        return {
            "success": True,
            "policies": policies,
            "count": len(policies)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching policies: {str(e)}")

@router.delete("/policies/{policy_id}")
async def delete_policy(
    policy_id: str,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """Delete a specific policy"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        # Check if policy exists
        policy = await db_service.get_policy_by_id(policy_id)
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        # Delete the policy
        success = await db_service.delete_policy(policy_id)
        
        if success:
            return {
                "success": True,
                "message": f"Policy '{policy['name']}' deleted successfully",
                "policy_id": policy_id
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to delete policy")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting policy: {str(e)}")

@router.delete("/{questionnaire_id}")
async def delete_questionnaire(
    questionnaire_id: str,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """Delete a questionnaire and all its questions"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        # Check if questionnaire exists
        questionnaires = await db_service.get_all_questionnaires()
        questionnaire = next((q for q in questionnaires if q["id"] == questionnaire_id), None)
        
        if not questionnaire:
            raise HTTPException(status_code=404, detail="Questionnaire not found")
        
        # Delete the questionnaire (this will also delete associated questions due to CASCADE)
        success = await db_service.delete_questionnaire(questionnaire_id)
        
        if success:
            return {
                "success": True,
                "message": f"Questionnaire '{questionnaire['name']}' and all its questions deleted successfully",
                "questionnaire_id": questionnaire_id
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to delete questionnaire")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting questionnaire: {str(e)}")

@router.get("/{questionnaire_id}/questions")
async def get_questions(
    questionnaire_id: str,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """Get all questions for a specific questionnaire"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        questions = await db_service.get_questions_by_questionnaire(questionnaire_id)
        
        return {
            "success": True,
            "questionnaire_id": questionnaire_id,
            "questions": questions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching questions: {str(e)}")

@router.post("/{questionnaire_id}/generate-answers")
async def generate_answers(
    questionnaire_id: str,
    background_tasks: BackgroundTasks,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Start AI answer generation for all questions in a questionnaire using policy documents
    Returns immediately while processing happens in the background
    """
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        # Get questions for the questionnaire to validate
        questions = await db_service.get_questions_by_questionnaire(questionnaire_id)
        
        if not questions:
            raise HTTPException(status_code=404, detail="No questions found for this questionnaire")
        
        # Get all policy documents text to validate
        policies = await db_service.get_all_policies()
        policy_context = "\n\n".join([p.get("extracted_text", "") for p in policies if p.get("extracted_text")])
        
        if not policy_context:
            raise HTTPException(status_code=400, detail="No policy documents found. Please upload PDF policies first.")
        
        # Start background task for generating answers
        background_tasks.add_task(
            generate_answers_background,
            questionnaire_id,
            settings.supabase_url,
            settings.supabase_key,
            settings.anthropic_api_key
        )
        
        return {
            "success": True,
            "message": f"Answer generation started for {len(questions)} questions",
            "questionnaire_id": questionnaire_id,
            "status": "processing",
            "total_questions": len(questions),
            "note": "Answers are being generated in the background. Please refresh to see progress."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answers: {str(e)}")

@router.put("/questions/{question_id}/answer")
async def update_answer(
    question_id: str, 
    answer_update: AnswerUpdate,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """Update an answer for a specific question"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        await db_service.update_question_answer(
            question_id, 
            answer_update.answer, 
            answer_update.status
        )
        
        return {
            "success": True,
            "message": "Answer updated successfully",
            "question_id": question_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating answer: {str(e)}")

@router.put("/questions/{question_id}/approve")
async def approve_answer(
    question_id: str,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """Approve an answer for a specific question"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        await db_service.update_question_status(question_id, "approved")
        
        return {
            "success": True,
            "message": "Answer approved successfully",
            "question_id": question_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving answer: {str(e)}")

@router.put("/questions/bulk-approve")
async def bulk_approve_answers(
    bulk_approval: BulkApproval,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """Bulk approve/unapprove multiple answers"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        updated_count = 0
        errors = []
        
        for question_id in bulk_approval.question_ids:
            try:
                await db_service.update_question_status(question_id, bulk_approval.status)
                updated_count += 1
            except Exception as e:
                errors.append(f"Error updating question {question_id}: {str(e)}")
        
        return {
            "success": True,
            "message": f"Updated {updated_count} questions",
            "updated_count": updated_count,
            "total_requested": len(bulk_approval.question_ids),
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in bulk approval: {str(e)}")

@router.get("/{questionnaire_id}/export")
async def export_approved_answers(
    questionnaire_id: str,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """Export approved answers for a questionnaire"""
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        # Get approved questions only
        questions = await db_service.get_approved_questions(questionnaire_id)
        
        if not questions:
            raise HTTPException(status_code=404, detail="No approved answers found for export")
        
        return {
            "success": True,
            "message": f"Found {len(questions)} approved answers",
            "questionnaire_id": questionnaire_id,
            "approved_questions": questions,
            "export_data": [
                {
                    "question": q["question_text"],
                    "answer": q["answer"]
                }
                for q in questions
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting answers: {str(e)}")
