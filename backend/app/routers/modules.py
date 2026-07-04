"""Standalone module endpoints (see API.md)."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import SLModule
from ..schemas import ModuleOut, ModuleUpdate
from .glosses import validate_gloss_sentence

router = APIRouter(tags=["modules"])


def _get_module_or_404(db: Session, module_id: int) -> SLModule:
    module = db.get(SLModule, module_id)
    if module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.get("/modules/{module_id}", response_model=ModuleOut)
def get_module(module_id: int, db: Session = Depends(get_db)):
    return _get_module_or_404(db, module_id)


@router.put("/modules/{module_id}", response_model=ModuleOut)
def update_module(
    module_id: int, payload: ModuleUpdate, db: Session = Depends(get_db)
):
    module = _get_module_or_404(db, module_id)
    data = payload.model_dump(exclude_unset=True)
    if "gloss_sentence" in data:
        validate_gloss_sentence(data["gloss_sentence"], db)
        data["gloss_sentence"] = data["gloss_sentence"].strip()
    for field, value in data.items():
        setattr(module, field, value)
    db.commit()
    db.refresh(module)
    return module


@router.delete("/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(module_id: int, db: Session = Depends(get_db)):
    module = _get_module_or_404(db, module_id)
    db.delete(module)
    db.commit()
    return None
