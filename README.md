# Aurelia - Luxury Fashion Platform

AURELIA is a high-end luxury e-commerce platform that offers a curated collection of fashion items. It features a minimalist design system with an Obsidian and Champagne Gold palette, glassmorphism UI elements, and a responsive multi-page layout. 

The backend is powered by FastAPI, featuring a keyword-driven AI personal shopper concierge, secure form handling for inquiries, and a payment simulation system.

## Project Structure

- `frontend/`: Contains the client-side code (HTML, CSS, JS).
  - `index.html`: Home page and product showcase.
  - `about.html`: Information about the brand and atelier.
  - `contact.html`: Inquiry and contact form.
  - `checkout.html`: Payment simulation and checkout flow.
  - `style.css`: Minimalist design system and styling.
  - `script.js`: Client-side interactivity and API integration.
- `backend/`: Contains the FastAPI server code.
  - `main.py`: Main API application.
  - `requirements.txt`: Python dependencies.

## Features

- **Responsive Design**: Minimalist and beautiful UI with glassmorphism.
- **Product Showcase**: Curated selection of luxury items.
- **AI Personal Shopper**: Keyword-driven API for personalized fashion recommendations.
- **Secure Inquiries**: Form handling for contacting the atelier.
- **Checkout Simulation**: Simulated payment flow for purchasing items.

## Setup and Installation

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the FastAPI server: `uvicorn main:app --reload`

### Frontend
1. Serve the `frontend` directory using any static file server (e.g., Live Server in VS Code or Python's `http.server`).
2. Open `index.html` in your browser.

## Deployment

A Dockerfile is provided to containerize the application for easy deployment.
