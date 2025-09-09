"""
Database service for Supabase operations
"""

from supabase import create_client, Client
from typing import List, Dict, Any, Optional
import os
import logging
from datetime import datetime
import uuid

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    """Database service for managing policies, questionnaires, and questions in Supabase"""
    
    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        """
        Initialize database service
        
        Args:
            supabase_url: Supabase URL (will use environment variable if not provided)
            supabase_key: Supabase API key (will use environment variable if not provided)
        """
        self.supabase_url = supabase_url or os.getenv("SUPABASE_URL")
        self.supabase_key = supabase_key or os.getenv("SUPABASE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Supabase URL and key are required. Set SUPABASE_URL and SUPABASE_KEY environment variables.")
        
        try:
            self.client: Client = create_client(self.supabase_url, self.supabase_key)
            logger.info("Successfully connected to Supabase")
        except Exception as e:
            logger.error(f"Failed to connect to Supabase: {str(e)}")
            raise Exception(f"Database connection failed: {str(e)}")
    
    # POLICY OPERATIONS
    
    async def create_policy(self, policy_data: Dict[str, Any]) -> str:
        """
        Create a new policy record
        
        Args:
            policy_data: Policy information including name, filename, extracted_text, file_size
            
        Returns:
            str: Policy ID
        """
        try:
            policy_record = {
                "id": str(uuid.uuid4()),
                "name": policy_data["name"],
                "filename": policy_data["filename"],
                "extracted_text": policy_data["extracted_text"],
                "file_size": policy_data["file_size"],
                "upload_date": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("policies").insert(policy_record).execute()
            
            if result.data:
                policy_id = result.data[0]["id"]
                logger.info(f"Created policy: {policy_id}")
                return policy_id
            else:
                raise Exception("Failed to create policy record")
                
        except Exception as e:
            logger.error(f"Error creating policy: {str(e)}")
            raise Exception(f"Database error creating policy: {str(e)}")
    
    async def get_all_policies(self) -> List[Dict[str, Any]]:
        """Get all policies"""
        try:
            result = self.client.table("policies").select("*").order("created_at", desc=True).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching policies: {str(e)}")
            raise Exception(f"Database error fetching policies: {str(e)}")
    
    async def get_policy_by_id(self, policy_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific policy by ID"""
        try:
            result = self.client.table("policies").select("*").eq("id", policy_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error fetching policy {policy_id}: {str(e)}")
            raise Exception(f"Database error fetching policy: {str(e)}")
    
    async def delete_policy(self, policy_id: str) -> bool:
        """Delete a policy"""
        try:
            result = self.client.table("policies").delete().eq("id", policy_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error deleting policy {policy_id}: {str(e)}")
            raise Exception(f"Database error deleting policy: {str(e)}")
    
    # QUESTIONNAIRE OPERATIONS
    
    async def create_questionnaire(self, questionnaire_data: Dict[str, Any], questions: List[Dict[str, Any]]) -> str:
        """
        Create a new questionnaire with questions
        
        Args:
            questionnaire_data: Questionnaire metadata
            questions: List of questions to create
            
        Returns:
            str: Questionnaire ID
        """
        try:
            questionnaire_id = str(uuid.uuid4())
            
            # Create questionnaire record
            questionnaire_record = {
                "id": questionnaire_id,
                "name": questionnaire_data["name"],
                "filename": questionnaire_data["filename"],
                "upload_date": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("questionnaires").insert(questionnaire_record).execute()
            
            if not result.data:
                raise Exception("Failed to create questionnaire record")
            
            # Create question records
            question_records = []
            for question in questions:
                question_record = {
                    "id": str(uuid.uuid4()),
                    "question_text": question["question_text"],
                    "answer": question.get("answer"),
                    "status": question.get("status", "unapproved"),
                    "questionnaire_id": questionnaire_id,
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
                question_records.append(question_record)
            
            if question_records:
                questions_result = self.client.table("questions").insert(question_records).execute()
                if not questions_result.data:
                    # Rollback questionnaire creation if questions fail
                    await self.delete_questionnaire(questionnaire_id)
                    raise Exception("Failed to create question records")
            
            logger.info(f"Created questionnaire: {questionnaire_id} with {len(question_records)} questions")
            return questionnaire_id
            
        except Exception as e:
            logger.error(f"Error creating questionnaire: {str(e)}")
            raise Exception(f"Database error creating questionnaire: {str(e)}")
    
    async def get_all_questionnaires(self) -> List[Dict[str, Any]]:
        """Get all questionnaires with question counts"""
        try:
            # Get questionnaires
            questionnaires_result = self.client.table("questionnaires").select("*").order("created_at", desc=True).execute()
            questionnaires = questionnaires_result.data
            
            # Get question counts for each questionnaire
            for questionnaire in questionnaires:
                questions_result = self.client.table("questions").select("id").eq("questionnaire_id", questionnaire["id"]).execute()
                questionnaire["question_count"] = len(questions_result.data)
            
            return questionnaires
        except Exception as e:
            logger.error(f"Error fetching questionnaires: {str(e)}")
            raise Exception(f"Database error fetching questionnaires: {str(e)}")
    
    async def delete_questionnaire(self, questionnaire_id: str) -> bool:
        """Delete a questionnaire and all its questions"""
        try:
            # Delete questions first (due to foreign key constraint)
            self.client.table("questions").delete().eq("questionnaire_id", questionnaire_id).execute()
            
            # Delete questionnaire
            result = self.client.table("questionnaires").delete().eq("id", questionnaire_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error deleting questionnaire {questionnaire_id}: {str(e)}")
            raise Exception(f"Database error deleting questionnaire: {str(e)}")
    
    # QUESTION OPERATIONS
    
    async def get_questions_by_questionnaire(self, questionnaire_id: str) -> List[Dict[str, Any]]:
        """Get all questions for a specific questionnaire"""
        try:
            result = self.client.table("questions").select("*").eq("questionnaire_id", questionnaire_id).order("created_at").execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching questions for questionnaire {questionnaire_id}: {str(e)}")
            raise Exception(f"Database error fetching questions: {str(e)}")
    
    async def update_question_answer(self, question_id: str, answer: str, status: str = "unapproved") -> bool:
        """Update a question's answer and status"""
        try:
            update_data = {
                "answer": answer,
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("questions").update(update_data).eq("id", question_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error updating question {question_id}: {str(e)}")
            raise Exception(f"Database error updating question: {str(e)}")
    
    async def update_question_status(self, question_id: str, status: str) -> bool:
        """Update a question's status only"""
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            result = self.client.table("questions").update(update_data).eq("id", question_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error updating question status {question_id}: {str(e)}")
            raise Exception(f"Database error updating question status: {str(e)}")
    
    async def get_approved_questions(self, questionnaire_id: str) -> List[Dict[str, Any]]:
        """Get all approved questions for a questionnaire"""
        try:
            result = self.client.table("questions").select("*").eq("questionnaire_id", questionnaire_id).eq("status", "approved").order("created_at").execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching approved questions for questionnaire {questionnaire_id}: {str(e)}")
            raise Exception(f"Database error fetching approved questions: {str(e)}")
    
    # UTILITY OPERATIONS
    
    async def test_connection(self) -> bool:
        """Test database connection"""
        try:
            # Try a simple query
            result = self.client.table("policies").select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {str(e)}")
            return False
    
    async def get_policy_by_id(self, policy_id: str) -> Optional[Dict[str, Any]]:
        """Get a single policy by ID"""
        try:
            response = self.client.table("policies").select("*").eq("id", policy_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error getting policy by ID: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

    async def delete_policy(self, policy_id: str) -> bool:
        """Delete a policy by ID"""
        try:
            response = self.client.table("policies").delete().eq("id", policy_id).execute()
            
            # Check if any rows were affected
            return len(response.data) > 0
                
        except Exception as e:
            logger.error(f"Error deleting policy: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

    async def delete_questionnaire(self, questionnaire_id: str) -> bool:
        """Delete a questionnaire and all its questions (CASCADE)"""
        try:
            # First delete all questions for this questionnaire
            questions_response = self.client.table("questions").delete().eq("questionnaire_id", questionnaire_id).execute()
            logger.info(f"Deleted {len(questions_response.data)} questions for questionnaire {questionnaire_id}")
            
            # Then delete the questionnaire
            questionnaire_response = self.client.table("questionnaires").delete().eq("id", questionnaire_id).execute()
            
            # Check if questionnaire was deleted
            return len(questionnaire_response.data) > 0
                
        except Exception as e:
            logger.error(f"Error deleting questionnaire: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

    async def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""
        try:
            policies_count = len(self.client.table("policies").select("id").execute().data)
            questionnaires_count = len(self.client.table("questionnaires").select("id").execute().data)
            questions_count = len(self.client.table("questions").select("id").execute().data)
            approved_questions_count = len(self.client.table("questions").select("id").eq("status", "approved").execute().data)
            
            return {
                "policies_count": policies_count,
                "questionnaires_count": questionnaires_count,
                "questions_count": questions_count,
                "approved_questions_count": approved_questions_count,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return {"error": str(e)}
