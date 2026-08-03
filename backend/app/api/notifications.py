from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class PushSubscriptionSchema(BaseModel):
    endpoint: str
    keys: dict

class SendNotificationSchema(BaseModel):
    title: str
    message: str
    token_number: str = None
    type: str = "info"  # booking_confirmed, token_ready, 10_mins_remaining, office_closed, server_down, lunch_break

@router.post("/subscribe")
def subscribe_push(sub: PushSubscriptionSchema):
    return {"status": "success", "message": "Subscribed to Shivamogga Seva Push Notifications"}

@router.post("/send")
def send_notification(payload: SendNotificationSchema):
    return {
        "status": "delivered",
        "title": payload.title,
        "message": payload.message,
        "token_number": payload.token_number,
        "type": payload.type
    }
