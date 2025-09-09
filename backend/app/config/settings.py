"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Configuration
    app_name: str = "Summit Security Questionnaire API"
    debug: bool = False
    
    # Database Configuration
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    
    # AI Configuration
    anthropic_api_key: Optional[str] = None
    
    # File Upload Configuration
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_pdf_extensions: list = [".pdf"]
    allowed_excel_extensions: list = [".xlsx", ".xls"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

def get_settings() -> Settings:
    return Settings()
