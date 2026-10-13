from fastapi import APIRouter, Depends, status
from typing import List

from backend.app.models.user import User
from backend.app.schemas.user import UserResponse, UserUpdate
from backend.app.services.user_service import UserService
from backend.app.services.dependencies import (
    get_user_service,
    get_current_user,
    get_current_active_admin
)

router = APIRouter(prefix="/users", tags=["User Management"])

@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 50,
    user_service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_current_user)
):
    """
    List registered healthcare system users. (Requires authentication)
    """
    return user_service.list_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    user_service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a user.
    """
    return user_service.get_user_by_id(user_id)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    user_service: UserService = Depends(get_user_service),
    current_user: User = Depends(get_current_user)
):
    """
    Update user profile. Users can edit their own profile; admins can edit anyone and modify roles.
    """
    return user_service.update_user_profile(user_id, user_update, current_user)

@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
def delete_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service),
    current_admin: User = Depends(get_current_active_admin)
):
    """
    Delete a user account. Restricted to Administrators.
    """
    user_service.delete_user(user_id, current_admin)
    return {"message": f"User ID #{user_id} successfully deleted"}
