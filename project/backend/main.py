"""
AURELIA — FastAPI Backend
Endpoints: /products, /chat, /process-payment, /contact-submit
"""

import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(title="AURELIA API", version="1.0.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)

class ChatResponse(BaseModel):
    reply: str

class PaymentItem(BaseModel):
    id: int
    name: str
    price: float
    qty: int = Field(..., ge=1)

class PaymentRequest(BaseModel):
    items: list[PaymentItem]
    total: float
    email: str

class PaymentResponse(BaseModel):
    status: str
    message: str

class ContactRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: str
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=5000)

class ContactResponse(BaseModel):
    status: str
    message: str

# --- Product Data ---

PRODUCTS = [
    {"id": 1, "name": "Notte Evening Gown", "price": 4200, "image": "images/product_gown.png"},
    {"id": 2, "name": "Dorata Leather Bag", "price": 2850, "image": "images/product_handbag.png"},
    {"id": 3, "name": "Milano Cashmere Overcoat", "price": 3600, "image": "images/product_overcoat.png"},
    {"id": 4, "name": "Luce Statement Necklace", "price": 5400, "image": "images/product_necklace.png"},
    {"id": 5, "name": "Firenze Oxford Shoes", "price": 1800, "image": "images/product_shoes.png"},
    {"id": 6, "name": "Seta Silk Scarf", "price": 780, "image": "images/product_scarf.png"},
]

# --- AI Concierge (Keyword-based) ---

def concierge_reply(message: str) -> str:
    m = message.lower()

    if any(w in m for w in ["material", "fabric", "silk", "cashmere", "wool", "leather", "cotton"]):
        return (
            "An excellent question. Our garments are crafted exclusively from the finest natural fibers — "
            "Italian silk woven in century-old mills of Como, hand-sourced cashmere from the highlands of "
            "Inner Mongolia, and vegetable-tanned leather from family-owned Tuscan tanneries. Each material "
            "is selected not merely for its provenance, but for the way it drapes, breathes, and ages with grace."
        )

    if any(w in m for w in ["price", "cost", "expensive", "afford", "budget", "worth"]):
        return (
            "At AURELIA, we believe that true luxury is an investment in enduring beauty. Our pricing reflects "
            "hundreds of hours of master artisan craftsmanship and the rarest materials on earth. I would be "
            "delighted to curate a selection within your preferred range — every piece in our collection carries "
            "the same unwavering commitment to excellence."
        )

    if any(w in m for w in ["shipping", "delivery", "deliver", "ship"]):
        return (
            "We offer complimentary worldwide shipping via private courier, presented in our signature "
            "black-and-gold packaging. Standard delivery arrives within 5–7 business days; express service "
            "is available in 2–3 days. Each parcel is handled with the reverence your selection deserves."
        )

    if any(w in m for w in ["return", "exchange", "refund"]):
        return (
            "We offer a gracious 30-day return policy for all ready-to-wear pieces. Items must be in their "
            "original, unworn condition with tags intact. Our client care team will arrange complimentary "
            "return shipping and process your refund within 5 business days."
        )

    if any(w in m for w in ["size", "fit", "sizing", "measurement"]):
        return (
            "Finding the perfect fit is essential. Our detailed size guide is available on each product page, "
            "with measurements in centimeters and inches. For a truly impeccable fit, I recommend our "
            "complimentary virtual fitting consultation — our stylists will guide you through precise "
            "measurements to ensure every piece feels as though it was made for you alone."
        )

    if any(w in m for w in ["recommend", "suggest", "best", "popular", "favorite"]):
        return (
            "I would be delighted to offer a personal recommendation. The Milano Cashmere Overcoat is "
            "a perennial favorite — a masterwork of restraint and warmth that transitions effortlessly from "
            "day to evening. For a statement of pure elegance, the Notte Evening Gown in Italian silk is "
            "simply unforgettable. Shall I tell you more about either piece?"
        )

    if any(w in m for w in ["gown", "dress", "evening", "notte"]):
        return (
            "The Notte Evening Gown is one of our most celebrated pieces. Cut from Como silk with a "
            "fluid bias construction, it moves like liquid midnight. The silhouette is deliberately minimal — "
            "allowing the extraordinary quality of the fabric to speak for itself. Priced at $4,200."
        )

    if any(w in m for w in ["bag", "handbag", "purse", "dorata"]):
        return (
            "The Dorata Leather Bag is handcrafted from vegetable-tanned Italian leather in our Florentine "
            "workshop. Its champagne gold hardware is cast, not stamped, and each bag takes approximately "
            "40 hours to complete. A timeless investment at $2,850."
        )

    if any(w in m for w in ["overcoat", "coat", "milano", "winter"]):
        return (
            "The Milano Cashmere Overcoat is the embodiment of quiet luxury. Tailored from grade-A Mongolian "
            "cashmere with a half-canvas construction, it provides extraordinary warmth without weight. "
            "The charcoal colorway pairs with everything in your wardrobe. Priced at $3,600."
        )

    if any(w in m for w in ["hello", "hi", "hey", "good morning", "good evening"]):
        return (
            "Good day. It is a genuine pleasure to welcome you to AURELIA. I am your personal style "
            "concierge, here to guide you through our collection, discuss our craftsmanship, or assist "
            "with any aspect of your experience. How may I be of service?"
        )

    if any(w in m for w in ["thank", "thanks"]):
        return (
            "The pleasure is entirely mine. Should you need anything further — whether today or any time "
            "in the future — please do not hesitate to reach out. At AURELIA, our commitment to you extends "
            "far beyond the moment of purchase."
        )

    return (
        "Thank you for your inquiry. I am here to assist you with anything related to the AURELIA "
        "collection — from exploring our pieces and discussing the finest materials, to sizing guidance "
        "and styling recommendations. What would you like to know?"
    )


# --- Endpoints ---

@app.get("/products")
async def get_products():
    return PRODUCTS


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    reply = concierge_reply(request.message)
    return ChatResponse(reply=reply)


@app.post("/process-payment", response_model=PaymentResponse)
async def process_payment(request: PaymentRequest):
    # Simulate payment processing delay
    await asyncio.sleep(2)
    return PaymentResponse(
        status="Payment Successful",
        message=f"Your order of ${request.total:,.2f} has been confirmed. A confirmation will be sent to {request.email}."
    )


@app.post("/contact-submit", response_model=ContactResponse)
async def contact_submit(request: ContactRequest):
    # In production, this would send an email or write to a database
    return ContactResponse(
        status="received",
        message=f"Thank you, {request.name}. Your inquiry regarding '{request.subject}' has been received. We will respond within 24 hours."
    )

# --- Static Files ---
@app.get("/")
async def root():
    return RedirectResponse(url="/index.html")

app.mount("/", StaticFiles(directory="../frontend"), name="frontend")
