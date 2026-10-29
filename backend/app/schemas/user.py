from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    PARENT = "parent"

class UserBase(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50, example="sarah_parent")
    email: EmailStr = Field(..., example="sarah@example.com")
    full_name: Optional[str] = Field(None, example="Sarah Connor")
    role: UserRole = Field(default=UserRole.PARENT, example=UserRole.PARENT)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, example="SecurePass123!")

class UserLogin(BaseModel):
    username: str = Field(..., example="sarah@example.com")
    password: str = Field(..., example="SecurePass123!")

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    password: Optional[str] = Field(None, min_length=6)
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
