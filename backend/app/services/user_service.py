from typing import List, Optional
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserUpdate, UserRole
from backend.app.interfaces.repositories import IUserRepository
from backend.app.interfaces.security import IPasswordHasher

class UserService:
    """
    User business logic service.
    Adheres to Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP).
    """

    def __init__(self, user_repo: IUserRepository, password_hasher: IPasswordHasher):
        self.user_repo = user_repo
        self.password_hasher = password_hasher

    def register_user(self, user_in: UserCreate) -> User:
        """Register a new user with validation and auto-admin logic for first user."""
        username = user_in.username
        if not username:
            base = user_in.email.split("@")[0]
            candidate = base
            counter = 1
            while self.user_repo.get_by_username(candidate):
                candidate = f"{base}{counter}"
                counter += 1
            username = candidate
        elif self.user_repo.get_by_username(username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken"
            )

        if self.user_repo.get_by_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered"
            )

        # First user is automatically assigned the admin role
        user_count = self.user_repo.count()
        raw_role = UserRole.ADMIN.value if user_count == 0 else user_in.role
        assigned_role = raw_role.value if hasattr(raw_role, "value") else str(raw_role)

        hashed_pwd = self.password_hasher.hash(user_in.password)
        new_user = User(
            username=username,
            email=user_in.email,
            hashed_password=hashed_pwd,
            full_name=user_in.full_name or username,
            role=assigned_role,
            is_active=True
        )
        return self.user_repo.create(new_user)

    def get_user_by_id(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        return user

    def list_users(self, skip: int = 0, limit: int = 50) -> List[User]:
        return self.user_repo.list(skip=skip, limit=limit)

    def update_user_profile(self, user_id: int, user_update: UserUpdate, actor_user: User) -> User:
        target_user = self.get_user_by_id(user_id)

        # Authorization: must be admin or the user themselves
        if actor_user.id != target_user.id and actor_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this user account"
            )

        if user_update.email is not None and user_update.email != target_user.email:
            existing = self.user_repo.get_by_email(user_update.email)
            if existing and existing.id != target_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email address is already in use by another account"
                )
            target_user.email = user_update.email

        if user_update.full_name is not None:
            target_user.full_name = user_update.full_name

        if user_update.password is not None:
            target_user.hashed_password = self.password_hasher.hash(user_update.password)

        if user_update.role is not None:
            if actor_user.role == "admin":
                target_user.role = user_update.role.value if hasattr(user_update.role, "value") else str(user_update.role)
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only administrators can modify user roles"
                )

        if user_update.is_active is not None:
            if actor_user.role == "admin":
                target_user.is_active = user_update.is_active
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only administrators can change user active status"
                )

        return self.user_repo.update(target_user)

    def delete_user(self, user_id: int, actor_admin: User) -> None:
        if actor_admin.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot delete their own active account"
            )

        target_user = self.get_user_by_id(user_id)
        self.user_repo.delete(target_user)
