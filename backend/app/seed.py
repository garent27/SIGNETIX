"""Idempotent database seeding.

Populates:
  * ``gloss`` from the model label map (assets2/label_map.json) — the single
    source of truth for which signs the model can recognise.
  * a starter set of categories and modules so the platform is explorable out of
    the box. Every module's gloss sequence uses only glosses from the label map.
"""
import json
import logging
from urllib.parse import quote

from .config import LABEL_MAP_PATH
from .database import SessionLocal
from .models import Gloss, SLCategory, SLModule

log = logging.getLogger("signetix.seed")


def _bim_link(gloss: str) -> str:
    """A 'how to sign this' lookup link for a gloss (BIM / MSL sign reference)."""
    term = gloss.replace("_", " ")
    return f"https://www.google.com/search?q=BIM+sign+language+{quote(term)}"


def _placeholder(label: str, bg: str, fg: str = "EEF2FB") -> str:
    return f"https://placehold.co/640x420/{bg}/{fg}/png?text={quote(label)}"


# (name, gloss_sequence, sentence, difficulty)
STARTER_CATEGORIES = [
    {
        "name": "Everyday Greetings",
        "description": "Open any conversation with warmth — greetings and check-ins you'll use every single day.",
        "image": "/brand/background/background1.jpg",
        "modules": [
            ("hi apa_khabar", "Hi, how are you?", "E"),
            ("assalamualaikum", "Peace be upon you.", "E"),
            ("apa_khabar baik", "How are you? I'm fine.", "M"),
        ],
    },
    {
        "name": "Food & Cravings",
        "description": "Order, share and talk about Malaysian food — starting with the nation's favourite plate.",
        "image": "/brand/background/background4.jpg",
        "modules": [
            ("beli nasi_lemak", "Buy nasi lemak.", "E"),
            ("nasi panas", "The rice is hot.", "M"),
            ("beli nasi", "Buy some rice.", "E"),
        ],
    },
    {
        "name": "Out & About",
        "description": "Everyday errands and getting around — borrowing, buying and moving through your day.",
        "image": "/brand/background/background3.jpg",
        "modules": [
            ("pinjam kereta", "Borrow the car.", "M"),
            ("beli kereta", "Buy a car.", "E"),
            ("jangan main kereta", "Don't play with the car.", "H"),
        ],
    },
    {
        "name": "Feelings & Conduct",
        "description": "Name emotions and set gentle boundaries — the signs that carry the most meaning.",
        "image": "/brand/background/background2.jpg",
        "modules": [
            ("jangan marah", "Don't be angry.", "M"),
            ("pandai_2 baik", "Clever and well-behaved.", "M"),
            ("jangan jahat", "Don't be naughty.", "M"),
        ],
    },
    {
        "name": "Weather Talk",
        "description": "Small talk that always works — describing the heat and the storms of the day.",
        "image": _placeholder("Weather", "121A2E", "3D8BFF"),
        "modules": [
            ("panas", "It's hot.", "E"),
            ("ribut", "A storm is coming.", "E"),
            ("panas ribut", "Hot now, stormy later.", "M"),
        ],
    },
]


def seed_glosses(db) -> None:
    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        actions = json.load(f)["actions_ordered"]
    existing = {name for (name,) in db.query(Gloss.name).all()}
    added = 0
    for name in actions:
        if name not in existing:
            db.add(Gloss(name=name, link=_bim_link(name)))
            added += 1
    if added:
        db.commit()
        log.info("Seeded %d glosses.", added)


def seed_content(db) -> None:
    if db.query(SLCategory).count() > 0:
        return  # categories already present — leave developer edits untouched
    for cat in STARTER_CATEGORIES:
        category = SLCategory(
            name=cat["name"],
            description=cat["description"],
            image=cat["image"],
            status=1,
        )
        db.add(category)
        db.flush()  # assign id
        for gloss_seq, sentence, difficulty in cat["modules"]:
            db.add(
                SLModule(
                    category_id=category.id,
                    gloss_sentence=gloss_seq,
                    sentence=sentence,
                    difficulty=difficulty,
                )
            )
    db.commit()
    log.info("Seeded %d starter categories.", len(STARTER_CATEGORIES))


def seed_database() -> None:
    db = SessionLocal()
    try:
        seed_glosses(db)
        seed_content(db)
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    from .database import Base, engine

    Base.metadata.create_all(bind=engine)
    seed_database()
    print("Seeding complete.")
