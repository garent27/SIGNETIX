"""ORM models mapping the DATA-MODEL.md schema.

Column names follow the spec's ``sl_category_*`` / ``sl_module_*`` / ``gloss_*``
naming so the database is faithful to DATA-MODEL.md, while the Python
attributes use friendlier names.
"""
from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Text,
    SmallInteger,
)
from sqlalchemy.orm import relationship

from .database import Base


class SLCategory(Base):
    __tablename__ = "sl_category"

    id = Column("sl_category_id", Integer, primary_key=True, index=True)
    name = Column("sl_category_name", String(120), unique=True, nullable=False)
    description = Column("sl_category_desc", Text, nullable=False, default="")
    image = Column("sl_category_img", String(512), nullable=True)
    # 1 = active (visible to users), 0 = draft / not ready
    status = Column("sl_category_status", SmallInteger, nullable=False, default=1)

    modules = relationship(
        "SLModule",
        back_populates="category",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    @property
    def quantity(self) -> int:
        """sl_category_quantity — derived from the related modules."""
        return len(self.modules)


class SLModule(Base):
    __tablename__ = "sl_module"

    id = Column("sl_module_id", Integer, primary_key=True, index=True)
    category_id = Column(
        "sl_module_category_id",
        Integer,
        ForeignKey("sl_category.sl_category_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # What the gloss sequence actually means, e.g. "How are you feeling now".
    sentence = Column("sl_module_sentence", Text, nullable=False)
    # The glosses the learner signs, space separated, e.g. "you feeling how".
    gloss_sentence = Column("sl_module_gloss_sentence", Text, nullable=False)
    # E (Easy), M (Moderate), H (Hard)
    difficulty = Column("sl_module_difficulty", String(1), nullable=False, default="E")

    category = relationship("SLCategory", back_populates="modules")


class Gloss(Base):
    __tablename__ = "gloss"

    id = Column("gloss_id", Integer, primary_key=True, index=True)
    name = Column("gloss_name", String(120), unique=True, nullable=False)
    # Link to the BIM (Bahasa Isyarat Malaysia) sign bank entry for this gloss.
    link = Column("gloss_link", String(512), nullable=True)
