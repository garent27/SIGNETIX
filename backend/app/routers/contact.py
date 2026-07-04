"""Contact form + newsletter endpoints (Contact.md).

For the MVP these simply acknowledge receipt and log to the server; wiring up a
real mailer / CRM is a later concern.
"""
import logging

from fastapi import APIRouter

from ..schemas import ContactMessage, MessageAck

router = APIRouter(tags=["contact"])
log = logging.getLogger("signetix.contact")


@router.post("/contact", response_model=MessageAck)
def submit_contact(payload: ContactMessage):
    log.info(
        "Contact message from %s <%s> (subscribe=%s): %s",
        payload.name,
        payload.email,
        payload.subscribe,
        payload.message,
    )
    return MessageAck(ok=True, detail="Thanks — your message has reached the Signetix team.")
