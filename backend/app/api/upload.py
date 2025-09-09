"""
File upload endpoints for PDF and Excel files
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict, Any
import io
import os

from app.services.pdf_processor import PDFProcessor
from app.services.excel_processor import ExcelProcessor
from app.services.database import DatabaseService
from app.config.settings import get_settings, Settings

router = APIRouter()

@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Upload and process a PDF file using PyPDF2
    
    Workflow:
    1. Validate file type and size
    2. Read file content into BytesIO
    3. Extract text using PyPDF2
    4. Store metadata and text in database
    """
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Read file content
    try:
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > settings.max_file_size:
            raise HTTPException(
                status_code=413, 
                detail=f"File size exceeds maximum allowed size of {settings.max_file_size} bytes"
            )
        
        # Process PDF with PyPDF2
        pdf_processor = PDFProcessor()
        extracted_text = pdf_processor.extract_text_from_bytes(file_content)
        
        # Store in database
        db_service = DatabaseService()
        policy_data = {
            "name": file.filename,
            "filename": file.filename,
            "extracted_text": extracted_text,
            "file_size": len(file_content),
        }
        
        policy_id = await db_service.create_policy(policy_data)
        
        return {
            "success": True,
            "message": "PDF uploaded and processed successfully",
            "policy_id": policy_id,
            "filename": file.filename,
            "file_size": len(file_content),
            "text_length": len(extracted_text),
            "text_preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.post("/excel")
async def upload_excel(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Upload and process an Excel file containing questionnaire data
    """
    
    # Validate file type
    if not any(file.filename.lower().endswith(ext) for ext in settings.allowed_excel_extensions):
        raise HTTPException(
            status_code=400, 
            detail="Only Excel files (.xlsx, .xls) are allowed"
        )
    
    try:
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > settings.max_file_size:
            raise HTTPException(
                status_code=413, 
                detail=f"File size exceeds maximum allowed size of {settings.max_file_size} bytes"
            )
        
        # Process Excel file
        excel_processor = ExcelProcessor()
        questions = excel_processor.extract_questions_from_bytes(file_content)
        
        # Store in database
        db_service = DatabaseService()
        questionnaire_data = {
            "name": file.filename,
            "filename": file.filename,
        }
        
        questionnaire_id = await db_service.create_questionnaire(questionnaire_data, questions)
        
        return {
            "success": True,
            "message": "Excel file uploaded and processed successfully",
            "questionnaire_id": questionnaire_id,
            "filename": file.filename,
            "file_size": len(file_content),
            "questions_count": len(questions),
            "questions_preview": questions[:3] if len(questions) > 3 else questions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing Excel file: {str(e)}")
