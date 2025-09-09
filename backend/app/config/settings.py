"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Optional, List, Union
import os
import json

class Settings(BaseSettings):
    # API Configuration
    app_name: str = "Summit Security Questionnaire API"
    debug: bool = False
    
    # Database Configuration
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    
    # AI Configuration
    anthropic_api_key: Optional[str] = None
    
    # CORS Configuration
    cors_origins: Union[List[str], str] = Field(default=["http://localhost:3000", "http://localhost:3001"])
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                # Try to parse as JSON
                return json.loads(v)
            except json.JSONDecodeError:
                # If not JSON, split by comma
                return [origin.strip() for origin in v.split(',')]
        return v
    
    # File Upload Configuration
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_pdf_extensions: list = [".pdf"]
    allowed_excel_extensions: list = [".xlsx", ".xls"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

def get_settings() -> Settings:
    return Settings()
