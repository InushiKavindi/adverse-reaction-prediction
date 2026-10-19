from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timezone

from backend.app.models.user import User
from backend.app.models.child import Child
from backend.app.schemas.child import (
    ChildCreate,
    ChildUpdate,
    ChildResponse,
    VaccineScheduleItem,
    VaccineStatusUpdate,
    calculate_age_in_months
)
from backend.app.interfaces.repositories import IChildRepository
from backend.app.services.schedule_service import (
    generate_vaccine_schedule,
    NATIONAL_VACCINE_DEFINITIONS,
    add_months_to_date
)
from backend.app.services.dependencies import get_child_repository, get_current_user

router = APIRouter(prefix="/children", tags=["Children Profiles & Schedules"])

@router.get("", response_model=List[ChildResponse])
def get_children(
    child_repo: IChildRepository = Depends(get_child_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all registered child profiles for the logged-in parent.
    """
    return child_repo.list_by_user(current_user.id)

@router.post("", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
def create_child(
    child_in: ChildCreate,
    child_repo: IChildRepository = Depends(get_child_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new child profile for the authenticated parent.
    Age in months is auto-calculated from the child's DOB (birth_date).
    """
    # Auto calculate age from DOB
    calculated_age = calculate_age_in_months(child_in.birth_date)
    final_age = child_in.age_months if (child_in.age_months is not None and child_in.age_months > 0) else calculated_age

    child = Child(
        user_id=current_user.id,
        name=child_in.name,
        birth_date=child_in.birth_date,
        sex=child_in.sex,
        age_months=final_age,
        allergies=child_in.allergies or "None reported",
        current_illness=child_in.current_illness if child_in.current_illness is not None else "",
        current_medication=child_in.current_medication if child_in.current_medication is not None else "",
        blood_group=child_in.blood_group or "O+",
        pediatrician=child_in.pediatrician or "Dr. K. Perera",
        emergency_contact=child_in.emergency_contact,
        vaccine_records={},
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    return child_repo.create(child)

@router.get("/{child_id}", response_model=ChildResponse)
def get_child_by_id(
    child_id: int,
    child_repo: IChildRepository = Depends(get_child_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a specific child profile by ID.
    """
    child = child_repo.get_by_id(child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found")
    if current_user.role != "admin" and child.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return child

@router.put("/{child_id}", response_model=ChildResponse)
def update_child(
    child_id: int,
    child_in: ChildUpdate,
    child_repo: IChildRepository = Depends(get_child_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing child profile.
    """
    child = child_repo.get_by_id(child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found")
    if current_user.role != "admin" and child.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if child_in.name is not None:
        child.name = child_in.name
    if child_in.birth_date is not None:
        child.birth_date = child_in.birth_date
        child.age_months = calculate_age_in_months(child_in.birth_date)
    if child_in.sex is not None:
        child.sex = child_in.sex
    if child_in.age_months is not None:
        child.age_months = child_in.age_months
    if child_in.allergies is not None:
        child.allergies = child_in.allergies
    if child_in.blood_group is not None:
        child.blood_group = child_in.blood_group
    if child_in.pediatrician is not None:
        child.pediatrician = child_in.pediatrician
    if child_in.emergency_contact is not None:
        child.emergency_contact = child_in.emergency_contact
    if child_in.current_illness is not None:
        child.current_illness = child_in.current_illness
    if child_in.current_medication is not None:
        child.current_medication = child_in.current_medication

    return child_repo.update(child)

@router.delete("/{child_id}", status_code=status.HTTP_200_OK)
def delete_child(
    child_id: int,
    child_repo: IChildRepository = Depends(get_child_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a child profile.
    """
    child = child_repo.get_by_id(child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found")
    if current_user.role != "admin" and child.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    child_repo.delete(child)
    return {"message": f"Child profile #{child_id} deleted"}

@router.get("/{child_id}/schedule", response_model=List[VaccineScheduleItem])
def get_child_schedule(
    child_id: int,
    child_repo: IChildRepository = Depends(get_child_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Get auto-calculated vaccination schedule for the specified child based on DOB.
    Enforces milestone clickability and status constraints.
    """
    child = child_repo.get_by_id(child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found")
    if current_user.role != "admin" and child.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return generate_vaccine_schedule(child.birth_date, getattr(child, "vaccine_records", {}))

@router.patch("/{child_id}/schedule/{vax_id}", response_model=List[VaccineScheduleItem])
def update_vaccine_status(
    child_id: int,
    vax_id: str,
    update_in: VaccineStatusUpdate,
    child_repo: IChildRepository = Depends(get_child_repository),
    current_user: User = Depends(get_current_user)
):
    """
    Update vaccination completion status for a specific milestone.
    """
    child = child_repo.get_by_id(child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found")
    if current_user.role != "admin" and child.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    date_completed = update_in.date_completed
    if update_in.status == "completed":
        # Disallow marking as completed before scheduled date arrives
        target_vax = next((v for v in NATIONAL_VACCINE_DEFINITIONS if v["id"] == vax_id), None)
        if target_vax:
            dob = None
            if child.birth_date:
                for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d"):
                    try:
                        dob = datetime.strptime(child.birth_date.strip(), fmt).date()
                        break
                    except Exception:
                        pass
            if not dob:
                dob = datetime.now(timezone.utc).date()
            due_date = add_months_to_date(dob, target_vax["targetAgeMonths"])
            today = datetime.now(timezone.utc).date()
            if due_date > today:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot complete milestone before its scheduled date ({due_date.strftime('%m/%d/%Y')})"
                )

        if not date_completed:
            date_completed = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    elif update_in.status != "completed":
        date_completed = None

    if hasattr(child_repo, "update_vaccine_status"):
        updated_child = child_repo.update_vaccine_status(
            child_id=child.id,
            vax_id=vax_id,
            status=update_in.status,
            date_completed=date_completed,
            reaction=update_in.reaction
        )
    else:
        records = dict(child.vaccine_records or {})
        rec = {"status": update_in.status, "dateCompleted": date_completed}
        if update_in.reaction is not None:
            rec["reaction"] = update_in.reaction
        records[vax_id] = rec
        child.vaccine_records = records
        updated_child = child_repo.update(child)

    records = getattr(updated_child, "vaccine_records", {}) if updated_child else {}
    return generate_vaccine_schedule(child.birth_date, records)
