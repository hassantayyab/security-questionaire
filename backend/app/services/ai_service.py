"""
AI service for generating questionnaire answers using Claude Sonnet 4 API
"""

import anthropic
from typing import Optional
import logging
import os
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    """AI service for generating answers using Anthropic Claude API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AI service
        
        Args:
            api_key: Anthropic API key (will use environment variable if not provided)
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        
        if not self.api_key:
            raise ValueError("Anthropic API key is required. Set ANTHROPIC_API_KEY environment variable or pass api_key parameter.")
        
        self.client = anthropic.Anthropic(api_key=self.api_key)
        
        # Claude model configuration
        self.model = "claude-3-sonnet-20240229"
        self.max_tokens = 1000
        self.temperature = 0.3  # Lower temperature for more consistent, factual responses
    
    async def generate_answer(self, question: str, policy_context: str) -> str:
        """
        Generate an answer for a question based on policy documents
        
        Args:
            question: The security questionnaire question
            policy_context: Full text content from all policy documents
            
        Returns:
            str: Generated answer
            
        Raises:
            Exception: If AI generation fails
        """
        try:
            logger.info(f"Generating answer for question: {question[:100]}...")
            
            # Create prompt for accurate answer generation
            prompt = self._create_prompt(question, policy_context)
            
            # Call Claude API
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            answer = response.content[0].text.strip()
            
            logger.info(f"Successfully generated answer ({len(answer)} characters)")
            
            return answer
            
        except anthropic.APIError as e:
            logger.error(f"Anthropic API error: {str(e)}")
            raise Exception(f"AI service error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in AI generation: {str(e)}")
            raise Exception(f"Error generating answer: {str(e)}")
    
    def _create_prompt(self, question: str, policy_context: str) -> str:
        """
        Create a well-structured prompt for answer generation
        
        Args:
            question: The question to answer
            policy_context: Policy documents content
            
        Returns:
            str: Formatted prompt
        """
        
        prompt = f"""You are a cybersecurity compliance expert helping to complete a security questionnaire. 

Your task is to analyze the provided policy documents and generate accurate, concise answers to security questionnaire questions.

GUIDELINES:
1. Answer in second person perspective (use "you", "your", "we", "our")
2. Base answers strictly on the provided policy documents
3. If information is not available in the policies, clearly state that
4. Keep answers concise but complete (2-4 sentences typically)
5. Focus on factual information, not opinions
6. Use professional, compliance-oriented language

POLICY DOCUMENTS:
{policy_context}

QUESTION TO ANSWER:
{question}

Please provide a clear, accurate answer based on the policy documents above. If the specific information needed to answer this question is not found in the policies, state that clearly and suggest what information would be needed."""

        return prompt
    
    async def generate_multiple_answers(self, questions: list, policy_context: str) -> dict:
        """
        Generate answers for multiple questions in batch
        
        Args:
            questions: List of question dictionaries
            policy_context: Policy documents content
            
        Returns:
            dict: Results with successful generations and errors
        """
        results = {
            "successful": [],
            "failed": [],
            "total_questions": len(questions)
        }
        
        for question_data in questions:
            try:
                question_text = question_data.get("question_text", "")
                answer = await self.generate_answer(question_text, policy_context)
                
                results["successful"].append({
                    "question_id": question_data.get("id"),
                    "question_text": question_text,
                    "answer": answer
                })
                
            except Exception as e:
                logger.error(f"Failed to generate answer for question: {question_data.get('question_text', '')[:50]}... Error: {str(e)}")
                
                results["failed"].append({
                    "question_id": question_data.get("id"),
                    "question_text": question_data.get("question_text", ""),
                    "error": str(e)
                })
        
        logger.info(f"Batch generation complete: {len(results['successful'])} successful, {len(results['failed'])} failed")
        
        return results
    
    def validate_api_key(self) -> bool:
        """
        Test if the API key is valid
        
        Returns:
            bool: True if API key is valid
        """
        try:
            # Make a simple test call
            response = self.client.messages.create(
                model=self.model,
                max_tokens=10,
                messages=[
                    {
                        "role": "user", 
                        "content": "Hello"
                    }
                ]
            )
            return True
        except Exception as e:
            logger.error(f"API key validation failed: {str(e)}")
            return False
    
    def get_usage_info(self) -> dict:
        """
        Get information about current API usage/limits
        
        Returns:
            dict: Usage information
        """
        return {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "timestamp": datetime.utcnow().isoformat()
        }
