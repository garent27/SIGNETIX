"""Pydantic request/response schemas."""
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict, Field


# ── Gloss ──────────────────────────────────────────────────────────────────
class GlossOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    link: Optional[str] = None


# ── Module ─────────────────────────────────────────────────────────────────
Difficulty = Literal["E", "M", "H"]


class ModuleBase(BaseModel):
    sentence: str = Field(..., min_length=1)
    gloss_sentence: str = Field(..., min_length=1)
    difficulty: Difficulty = "E"


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseModel):
    sentence: Optional[str] = Field(None, min_length=1)
    gloss_sentence: Optional[str] = Field(None, min_length=1)
    difficulty: Optional[Difficulty] = None


class ModuleOut(ModuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category_id: int


# ── Category ───────────────────────────────────────────────────────────────
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: str = ""
    image: Optional[str] = None
    status: int = 1


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = None
    image: Optional[str] = None
    status: Optional[int] = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quantity: int


class CategoryWithModules(CategoryOut):
    modules: List[ModuleOut] = []


# ── Misc ───────────────────────────────────────────────────────────────────
class UploadOut(BaseModel):
    url: str


class ContactMessage(BaseModel):
    name: str = Field(..., min_length=1)
    email: str = Field(..., min_length=3)
    phone: Optional[str] = None
    message: str = Field(..., min_length=1)
    subscribe: bool = False


class MessageAck(BaseModel):
    ok: bool
    detail: str
