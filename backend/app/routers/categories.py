"""Sign category endpoints (see API.md)."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import SLCategory, SLModule
from ..schemas import (
    CategoryCreate,
    CategoryOut,
    CategoryUpdate,
    ModuleCreate,
    ModuleOut,
)
from .glosses import validate_gloss_sentence

router = APIRouter(tags=["categories"])


def _get_category_or_404(db: Session, category_id: int) -> SLCategory:
    category = db.get(SLCategory, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Sign category not found")
    return category


@router.get("/sign-categories/", response_model=List[CategoryOut])
def list_categories(
    include_drafts: bool = Query(
        False, description="Include categories with status=0 (developer view)."
    ),
    db: Session = Depends(get_db),
):
    query = db.query(SLCategory)
    if not include_drafts:
        query = query.filter(SLCategory.status == 1)
    return query.order_by(SLCategory.id).all()


@router.get("/sign-categories/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    return _get_category_or_404(db, category_id)


@router.post(
    "/sign-categories",
    response_model=CategoryOut,
    status_code=status.HTTP_201_CREATED,
)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    if db.query(SLCategory).filter(SLCategory.name == payload.name).first():
        raise HTTPException(status_code=409, detail="A category with this name already exists")
    category = SLCategory(
        name=payload.name,
        description=payload.description,
        image=payload.image,
        status=payload.status,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/sign-categories/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)
):
    category = _get_category_or_404(db, category_id)
    data = payload.model_dump(exclude_unset=True)
    if "name" in data and data["name"] != category.name:
        if db.query(SLCategory).filter(SLCategory.name == data["name"]).first():
            raise HTTPException(status_code=409, detail="A category with this name already exists")
    for field, value in data.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/sign-categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Recursively deletes the category and every module beneath it."""
    category = _get_category_or_404(db, category_id)
    db.delete(category)  # cascade removes child modules
    db.commit()
    return None


# ── Modules nested under a category ────────────────────────────────────────
@router.get(
    "/sign-categories/{category_id}/modules", response_model=List[ModuleOut]
)
def list_category_modules(category_id: int, db: Session = Depends(get_db)):
    _get_category_or_404(db, category_id)
    return (
        db.query(SLModule)
        .filter(SLModule.category_id == category_id)
        .order_by(SLModule.id)
        .all()
    )


@router.post(
    "/sign-categories/{category_id}/modules",
    response_model=ModuleOut,
    status_code=status.HTTP_201_CREATED,
)
def create_module(
    category_id: int, payload: ModuleCreate, db: Session = Depends(get_db)
):
    _get_category_or_404(db, category_id)
    # Validate that every gloss exists in the model's label map.
    validate_gloss_sentence(payload.gloss_sentence, db)
    module = SLModule(
        category_id=category_id,
        sentence=payload.sentence,
        gloss_sentence=payload.gloss_sentence.strip(),
        difficulty=payload.difficulty,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module
