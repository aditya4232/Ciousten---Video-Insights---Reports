"""
API Key Management Routes
Secure management of user API keys
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.models.api_keys import APIKey
from app.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

router = APIRouter()


class APIKeyCreate(BaseModel):
    service_name: str  # openrouter, openai, anthropic, etc.
    api_key: str
    key_name: Optional[str] = None


class APIKeyResponse(BaseModel):
    id: str
    service_name: str
    key_name: Optional[str]
    masked_key: str
    is_active: bool
    created_at: datetime
    last_used: Optional[datetime]


class APIKeyUpdate(BaseModel):
    key_name: Optional[str] = None
    is_active: Optional[bool] = None


@router.post("/keys", response_model=APIKeyResponse)
async def create_api_key(
    key_data: APIKeyCreate,
    user_id: str = "default_user",  # In production, get from auth
    db: AsyncSession = Depends(get_db)
):
    """
    Store a new API key securely
    
    Supported services:
    - openrouter
    - openai
    - anthropic
    - huggingface
    - replicate
    """
    # Encrypt the API key
    encrypted_key = APIKey.encrypt_key(key_data.api_key)
    
    # Create new API key record
    api_key = APIKey(
        user_id=user_id,
        service_name=key_data.service_name,
        encrypted_key=encrypted_key,
        key_name=key_data.key_name or f"{key_data.service_name} Key"
    )
    
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)
    
    # Return masked key
    return APIKeyResponse(
        id=api_key.id,
        service_name=api_key.service_name,
        key_name=api_key.key_name,
        masked_key=mask_api_key(key_data.api_key),
        is_active=api_key.is_active,
        created_at=api_key.created_at,
        last_used=api_key.last_used
    )


@router.get("/keys", response_model=List[APIKeyResponse])
async def list_api_keys(
    user_id: str = "default_user",
    db: AsyncSession = Depends(get_db)
):
    """List all API keys for the user"""
    result = await db.execute(
        select(APIKey).where(APIKey.user_id == user_id)
    )
    keys = result.scalars().all()
    
    return [
        APIKeyResponse(
            id=key.id,
            service_name=key.service_name,
            key_name=key.key_name,
            masked_key=mask_api_key(key.get_decrypted_key()),
            is_active=key.is_active,
            created_at=key.created_at,
            last_used=key.last_used
        )
        for key in keys
    ]


@router.get("/keys/{key_id}", response_model=APIKeyResponse)
async def get_api_key(
    key_id: str,
    user_id: str = "default_user",
    db: AsyncSession = Depends(get_db)
):
    """Get a specific API key"""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == key_id,
            APIKey.user_id == user_id
        )
    )
    key = result.scalar_one_or_none()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return APIKeyResponse(
        id=key.id,
        service_name=key.service_name,
        key_name=key.key_name,
        masked_key=mask_api_key(key.get_decrypted_key()),
        is_active=key.is_active,
        created_at=key.created_at,
        last_used=key.last_used
    )


@router.patch("/keys/{key_id}", response_model=APIKeyResponse)
async def update_api_key(
    key_id: str,
    update_data: APIKeyUpdate,
    user_id: str = "default_user",
    db: AsyncSession = Depends(get_db)
):
    """Update an API key"""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == key_id,
            APIKey.user_id == user_id
        )
    )
    key = result.scalar_one_or_none()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    if update_data.key_name is not None:
        key.key_name = update_data.key_name
    if update_data.is_active is not None:
        key.is_active = update_data.is_active
    
    await db.commit()
    await db.refresh(key)
    
    return APIKeyResponse(
        id=key.id,
        service_name=key.service_name,
        key_name=key.key_name,
        masked_key=mask_api_key(key.get_decrypted_key()),
        is_active=key.is_active,
        created_at=key.created_at,
        last_used=key.last_used
    )


@router.delete("/keys/{key_id}")
async def delete_api_key(
    key_id: str,
    user_id: str = "default_user",
    db: AsyncSession = Depends(get_db)
):
    """Delete an API key"""
    result = await db.execute(
        select(APIKey).where(
            APIKey.id == key_id,
            APIKey.user_id == user_id
        )
    )
    key = result.scalar_one_or_none()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    await db.delete(key)
    await db.commit()
    
    return {
        "message": "API key deleted successfully",
        "key_id": key_id
    }


@router.get("/keys/service/{service_name}")
async def get_active_key_for_service(
    service_name: str,
    user_id: str = "default_user",
    db: AsyncSession = Depends(get_db)
):
    """Get active API key for a specific service"""
    result = await db.execute(
        select(APIKey).where(
            APIKey.user_id == user_id,
            APIKey.service_name == service_name,
            APIKey.is_active == True
        ).order_by(APIKey.created_at.desc())
    )
    key = result.scalar_one_or_none()
    
    if not key:
        return {
            "has_key": False,
            "service_name": service_name,
            "message": "No active API key found for this service"
        }
    
    # Update last used
    key.last_used = datetime.utcnow()
    await db.commit()
    
    return {
        "has_key": True,
        "service_name": service_name,
        "key_id": key.id,
        "decrypted_key": key.get_decrypted_key()  # Only for internal use
    }


def mask_api_key(api_key: str) -> str:
    """Mask API key for display"""
    if len(api_key) <= 8:
        return "*" * len(api_key)
    return f"{api_key[:4]}{'*' * (len(api_key) - 8)}{api_key[-4:]}"


@router.get("/services/supported")
async def get_supported_services():
    """Get list of supported AI services"""
    return {
        "services": [
            {
                "name": "OpenRouter",
                "key": "openrouter",
                "description": "Access to multiple LLM models",
                "website": "https://openrouter.ai",
                "key_format": "sk-or-v1-..."
            },
            {
                "name": "OpenAI",
                "key": "openai",
                "description": "GPT-4, GPT-3.5, DALL-E",
                "website": "https://platform.openai.com",
                "key_format": "sk-..."
            },
            {
                "name": "Anthropic",
                "key": "anthropic",
                "description": "Claude models",
                "website": "https://console.anthropic.com",
                "key_format": "sk-ant-..."
            },
            {
                "name": "Hugging Face",
                "key": "huggingface",
                "description": "Open-source models",
                "website": "https://huggingface.co",
                "key_format": "hf_..."
            },
            {
                "name": "Replicate",
                "key": "replicate",
                "description": "Run AI models via API",
                "website": "https://replicate.com",
                "key_format": "r8_..."
            }
        ]
    }
