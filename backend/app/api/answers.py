"""
Answer library management endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime

from app.services.database import DatabaseService
from app.config.settings import get_settings, Settings

router = APIRouter()


class AnswerCreate(BaseModel):
    """Model for creating a new answer"""
    question: str
    answer: str


class AnswerUpdate(BaseModel):
    """Model for updating an existing answer"""
    question: str
    answer: str


class BulkAnswerCreate(BaseModel):
    """Model for bulk creating answers"""
    answers: List[AnswerCreate]


@router.get("/")
async def get_answers(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """
    Get all answers from the library
    
    Returns:
        List of all answers with their metadata
    """
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        answers = await db_service.get_all_answers()
        
        return {
            "success": True,
            "answers": answers,
            "count": len(answers)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching answers: {str(e)}")


@router.post("/")
async def create_answer(
    answer_data: AnswerCreate,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Create a new answer in the library
    
    Args:
        answer_data: Question and answer text
        
    Returns:
        Created answer with generated ID and metadata
    """
    try:
        # Validate input
        if not answer_data.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        if not answer_data.answer.strip():
            raise HTTPException(status_code=400, detail="Answer cannot be empty")
        
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        answer_id = await db_service.create_answer({
            "question": answer_data.question.strip(),
            "answer": answer_data.answer.strip()
        })
        
        # Get the created answer to return
        created_answer = await db_service.get_answer_by_id(answer_id)
        
        return {
            "success": True,
            "message": "Answer created successfully",
            "answer": created_answer
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating answer: {str(e)}")


@router.post("/bulk-import")
async def bulk_import_answers(
    bulk_data: BulkAnswerCreate,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Bulk import multiple answers from Excel
    
    Args:
        bulk_data: List of question and answer pairs
        
    Returns:
        Import results with success/error counts
    """
    try:
        # Validate input
        if not bulk_data.answers:
            raise HTTPException(status_code=400, detail="No answers provided")
        
        if len(bulk_data.answers) > 1000:
            raise HTTPException(status_code=400, detail="Maximum 1000 answers per import")
        
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        # Prepare answers for bulk insert
        answers_to_insert = []
        for idx, answer in enumerate(bulk_data.answers):
            if not answer.question.strip():
                continue  # Skip empty questions
            
            if not answer.answer.strip():
                continue  # Skip empty answers
            
            answers_to_insert.append({
                "question": answer.question.strip(),
                "answer": answer.answer.strip()
            })
        
        # Bulk create answers
        result = await db_service.bulk_create_answers(answers_to_insert)
        
        return {
            "success": True,
            "message": f"Imported {result['success_count']} answers successfully",
            "success_count": result["success_count"],
            "error_count": result["error_count"],
            "total_submitted": len(bulk_data.answers),
            "errors": result.get("errors", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing answers: {str(e)}")


@router.put("/{answer_id}")
async def update_answer(
    answer_id: str,
    answer_data: AnswerUpdate,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Update an existing answer
    
    Args:
        answer_id: ID of the answer to update
        answer_data: Updated question and answer text
        
    Returns:
        Updated answer data
    """
    try:
        # Validate input
        if not answer_data.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        if not answer_data.answer.strip():
            raise HTTPException(status_code=400, detail="Answer cannot be empty")
        
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        # Check if answer exists
        existing_answer = await db_service.get_answer_by_id(answer_id)
        if not existing_answer:
            raise HTTPException(status_code=404, detail="Answer not found")
        
        # Update the answer
        success = await db_service.update_answer(answer_id, {
            "question": answer_data.question.strip(),
            "answer": answer_data.answer.strip()
        })
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update answer")
        
        # Get the updated answer
        updated_answer = await db_service.get_answer_by_id(answer_id)
        
        return {
            "success": True,
            "message": "Answer updated successfully",
            "answer": updated_answer
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating answer: {str(e)}")


@router.delete("/{answer_id}")
async def delete_answer(
    answer_id: str,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Delete an answer from the library
    
    Args:
        answer_id: ID of the answer to delete
        
    Returns:
        Success message
    """
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        # Check if answer exists
        existing_answer = await db_service.get_answer_by_id(answer_id)
        if not existing_answer:
            raise HTTPException(status_code=404, detail="Answer not found")
        
        # Delete the answer
        success = await db_service.delete_answer(answer_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete answer")
        
        return {
            "success": True,
            "message": "Answer deleted successfully",
            "answer_id": answer_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting answer: {str(e)}")


@router.get("/{answer_id}")
async def get_answer(
    answer_id: str,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Get a specific answer by ID
    
    Args:
        answer_id: ID of the answer to retrieve
        
    Returns:
        Answer data
    """
    try:
        db_service = DatabaseService(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key
        )
        
        answer = await db_service.get_answer_by_id(answer_id)
        
        if not answer:
            raise HTTPException(status_code=404, detail="Answer not found")
        
        return {
            "success": True,
            "answer": answer
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching answer: {str(e)}")

