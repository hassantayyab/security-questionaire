"""
Questionnaire management and AI answer generation endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from pydantic import BaseModel

from app.services.ai_service import AIService
from app.services.database import DatabaseService
from app.config.settings import get_settings, Settings

router = APIRouter()

class AnswerUpdate(BaseModel):
    answer: str
    status: str = "unapproved"

class BulkApproval(BaseModel):
    question_ids: List[str]
    status: str

@router.get("/")
async def get_questionnaires() -> Dict[str, Any]:
    """Get all questionnaires"""
    try:
        db_service = DatabaseService()
        questionnaires = await db_service.get_all_questionnaires()
        
        return {
            "success": True,
            "questionnaires": questionnaires
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching questionnaires: {str(e)}")

@router.get("/{questionnaire_id}/questions")
async def get_questions(questionnaire_id: str) -> Dict[str, Any]:
    """Get all questions for a specific questionnaire"""
    try:
        db_service = DatabaseService()
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
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Generate AI answers for all questions in a questionnaire using policy documents
    """
    try:
        db_service = DatabaseService()
        ai_service = AIService()
        
        # Get questions for the questionnaire
        questions = await db_service.get_questions_by_questionnaire(questionnaire_id)
        
        if not questions:
            raise HTTPException(status_code=404, detail="No questions found for this questionnaire")
        
        # Get all policy documents text
        policies = await db_service.get_all_policies()
        policy_context = "\n\n".join([p.get("extracted_text", "") for p in policies if p.get("extracted_text")])
        
        if not policy_context:
            raise HTTPException(status_code=400, detail="No policy documents found. Please upload PDF policies first.")
        
        generated_count = 0
        errors = []
        
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
                generated_count += 1
                
            except Exception as e:
                errors.append(f"Error generating answer for question '{question['question_text'][:50]}...': {str(e)}")
        
        return {
            "success": True,
            "message": f"Generated answers for {generated_count} questions",
            "questionnaire_id": questionnaire_id,
            "generated_count": generated_count,
            "total_questions": len(questions),
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answers: {str(e)}")

@router.put("/questions/{question_id}/answer")
async def update_answer(
    question_id: str, 
    answer_update: AnswerUpdate
) -> Dict[str, Any]:
    """Update an answer for a specific question"""
    try:
        db_service = DatabaseService()
        
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
async def approve_answer(question_id: str) -> Dict[str, Any]:
    """Approve an answer for a specific question"""
    try:
        db_service = DatabaseService()
        
        await db_service.update_question_status(question_id, "approved")
        
        return {
            "success": True,
            "message": "Answer approved successfully",
            "question_id": question_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error approving answer: {str(e)}")

@router.put("/questions/bulk-approve")
async def bulk_approve_answers(bulk_approval: BulkApproval) -> Dict[str, Any]:
    """Bulk approve/unapprove multiple answers"""
    try:
        db_service = DatabaseService()
        
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
async def export_approved_answers(questionnaire_id: str) -> Dict[str, Any]:
    """Export approved answers for a questionnaire"""
    try:
        db_service = DatabaseService()
        
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
