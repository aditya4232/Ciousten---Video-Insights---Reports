"""
API Key Management
Secure storage and management of user API keys
"""
from sqlalchemy import Column, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.db import Base
import secrets
from cryptography.fernet import Fernet
import os


# Encryption key (should be in environment variables in production)
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
cipher_suite = Fernet(ENCRYPTION_KEY)


class APIKey(Base):
    """User API Keys for external services"""
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True, default=lambda: secrets.token_urlsafe(16))
    user_id = Column(String, nullable=False, index=True)  # Session ID or user identifier
    service_name = Column(String, nullable=False)  # e.g., "openrouter", "openai", "anthropic"
    encrypted_key = Column(Text, nullable=False)
    key_name = Column(String, nullable=True)  # User-friendly name
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used = Column(DateTime(timezone=True), nullable=True)
    
    @staticmethod
    def encrypt_key(api_key: str) -> str:
        """Encrypt an API key"""
        return cipher_suite.encrypt(api_key.encode()).decode()
    
    @staticmethod
    def decrypt_key(encrypted_key: str) -> str:
        """Decrypt an API key"""
        return cipher_suite.decrypt(encrypted_key.encode()).decode()
    
    def get_decrypted_key(self) -> str:
        """Get the decrypted API key"""
        return self.decrypt_key(self.encrypted_key)
