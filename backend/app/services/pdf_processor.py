"""
PDF processing service using PyPDF2 with BytesIO memory processing

Implements the workflow:
1. File Upload: PDF is uploaded via FastAPI's UploadFile parameter
2. Memory Processing: PDF content is read into a BytesIO object for in-memory processing
3. Text Extraction: PyPDF2.PdfReader processes the PDF directly from memory
4. Page Iteration: Loop through all pages using reader.pages to extract text from each page
5. Text Concatenation: Combine all page text into a single string for storage
6. Database Storage: Store the extracted text content in the database
"""

import io
from typing import Union
import PyPDF2
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFProcessor:
    """PDF processing service using PyPDF2 library"""
    
    def extract_text_from_bytes(self, pdf_bytes: bytes) -> str:
        """
        Extract text from PDF bytes using PyPDF2 with BytesIO memory processing
        
        Args:
            pdf_bytes: PDF file content as bytes
            
        Returns:
            str: Extracted text from all pages concatenated together
            
        Raises:
            Exception: If PDF processing fails
        """
        try:
            # Step 2: Memory Processing - Read PDF content into BytesIO object
            pdf_stream = io.BytesIO(pdf_bytes)
            
            # Step 3: Text Extraction - Use PyPDF2.PdfReader to process PDF from memory
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            
            # Log PDF info
            logger.info(f"Processing PDF with {len(pdf_reader.pages)} pages")
            
            # Step 4: Page Iteration - Loop through all pages to extract text
            extracted_text_pages = []
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():  # Only add non-empty pages
                        extracted_text_pages.append(page_text)
                        logger.info(f"Extracted {len(page_text)} characters from page {page_num + 1}")
                    else:
                        logger.warning(f"Page {page_num + 1} appears to be empty")
                except Exception as e:
                    logger.error(f"Error extracting text from page {page_num + 1}: {str(e)}")
                    # Continue processing other pages even if one fails
                    continue
            
            # Step 5: Text Concatenation - Combine all page text into a single string
            if not extracted_text_pages:
                raise Exception("No readable text found in PDF")
            
            full_text = "\n\n".join(extracted_text_pages)
            
            logger.info(f"Successfully extracted {len(full_text)} total characters from PDF")
            
            return full_text
            
        except PyPDF2.errors.PdfReadError as e:
            logger.error(f"PDF read error: {str(e)}")
            raise Exception(f"Invalid or corrupted PDF file: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error processing PDF: {str(e)}")
            raise Exception(f"Error processing PDF: {str(e)}")
    
    def extract_text_from_file(self, file_path: str) -> str:
        """
        Extract text from PDF file path (alternative method)
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            str: Extracted text from all pages
        """
        try:
            with open(file_path, 'rb') as file:
                pdf_bytes = file.read()
                return self.extract_text_from_bytes(pdf_bytes)
        except FileNotFoundError:
            raise Exception(f"PDF file not found: {file_path}")
        except Exception as e:
            raise Exception(f"Error reading PDF file: {str(e)}")
    
    def get_pdf_metadata(self, pdf_bytes: bytes) -> dict:
        """
        Get metadata from PDF
        
        Args:
            pdf_bytes: PDF file content as bytes
            
        Returns:
            dict: PDF metadata including page count, title, etc.
        """
        try:
            pdf_stream = io.BytesIO(pdf_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_stream)
            
            metadata = {
                "page_count": len(pdf_reader.pages),
                "is_encrypted": pdf_reader.is_encrypted
            }
            
            # Try to get document metadata
            if pdf_reader.metadata:
                metadata.update({
                    "title": pdf_reader.metadata.get("/Title", ""),
                    "author": pdf_reader.metadata.get("/Author", ""),
                    "subject": pdf_reader.metadata.get("/Subject", ""),
                    "creator": pdf_reader.metadata.get("/Creator", ""),
                    "producer": pdf_reader.metadata.get("/Producer", ""),
                    "creation_date": str(pdf_reader.metadata.get("/CreationDate", "")),
                    "modification_date": str(pdf_reader.metadata.get("/ModDate", ""))
                })
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting PDF metadata: {str(e)}")
            return {"error": str(e)}
