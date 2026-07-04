"""Gloss endpoints + the validation helper used when authoring modules.

The set of valid glosses is the model's label map (assets2/label_map.json),
mirrored into the ``gloss`` table on startup. Developer.md requires that a
module's gloss sequence only contains glosses the model can recognise.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Gloss
from ..schemas import GlossOut

router = APIRouter(tags=["glosses"])


@router.get("/glosses/", response_model=List[GlossOut])
def list_glosses(db: Session = Depends(get_db)):
    return db.query(Gloss).order_by(Gloss.name).all()


@router.get("/glosses/search", response_model=List[GlossOut])
def search_glosses(
    q: str = Query("", description="Prefix/substring filter for the gloss authoring search."),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(Gloss)
    if q:
        query = query.filter(Gloss.name.ilike(f"%{q.strip().lower()}%"))
    return query.order_by(Gloss.name).limit(limit).all()


def validate_gloss_sentence(gloss_sentence: str, db: Session) -> List[str]:
    """Ensure every token in a gloss sentence is a known gloss.

    Raises HTTP 422 listing the unknown tokens, otherwise returns the token list.
    """
    tokens = [t for t in gloss_sentence.strip().split() if t]
    if not tokens:
        raise HTTPException(status_code=422, detail="Gloss sequence cannot be empty")
    known = {name for (name,) in db.query(Gloss.name).all()}
    unknown = [t for t in tokens if t not in known]
    if unknown:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown gloss(es) not in the model label map: {', '.join(unknown)}",
        )
    return tokens
