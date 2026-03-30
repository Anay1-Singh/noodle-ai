# Noodle AI: The Intelligent Core of Personal Fitness

Noodle is a high-performance, full-stack fitness ecosystem that leverages Large Language Models (LLMs) to bridge the gap between static workout tracking and personalized, human-centric coaching.

Built with a security-first philosophy, Noodle provides a scalable architecture for wellness tracking, real-time AI interaction, and structured user management.

---

## Overview

Noodle is not a conventional CRUD application. It represents a practical implementation of modern software engineering principles, integrating an intelligent fitness coach powered by LLaMA 3 with a production-ready Node.js backend.

The platform is designed to handle real-world requirements, including atomic rate-limiting, tier-based access control, and defense-in-depth security strategies, while maintaining a responsive and dynamic user interface.

---

## Tech Stack

### Core Infrastructure

#### Frontend
- React.js (component-based architecture)
- Tailwind CSS
- Framer Motion (animation system)

#### Backend
- Node.js
- Express.js (RESTful API design)

#### Database
- MongoDB Atlas
- Mongoose ODM

---

### Intelligence & Orchestration

#### AI Engine
- LLaMA 3 (8B Instruct) via OpenRouter API

#### State Management
- React Context API
- Custom Hooks

#### Authentication
- JSON Web Tokens (JWT) stored in HTTP-only cookies

---

## Key Features

### AI-Powered Fitness Coaching
- Context-aware responses based on user metadata (age, height, weight, fitness goals)
- Tier-based intelligence system:
  - Beginner (Easy)
  - Intermediate (Medium)
  - Advanced (Hard)
- Persistent conversational memory with a rolling window of up to 50 messages

---

### Security Architecture (Defense-in-Depth)

Noodle implements multiple layers of security to ensure data protection and system integrity:

- Password hashing using bcrypt
- OTP-based email verification for identity validation
- Input sanitization to prevent XSS attacks
- NoSQL injection prevention using MongoDB sanitization and schema validation
- Secure HTTP headers via Helmet.js
- Global rate limiting to mitigate brute-force and abuse attempts
- HTTP-only cookies to prevent client-side token access

---

### Wellness Tracking System
- Tracks user metrics including:
  - Steps
  - Calories burned
  - Sleep duration
  - Water intake
  - Mood logs
- Structured onboarding system ensures accurate initial data collection
- Persistent storage for long-term progress tracking

---

## System Architecture

The system follows a modular, layered architecture with clear separation of concerns:

User → Frontend (React) → Middleware (Auth & Rate Limiting) → Backend (Express) → Database (MongoDB Atlas) / AI Engine (OpenRouter)

---

## Security Hardening

| Layer          | Implementation                                                                 |
|----------------|--------------------------------------------------------------------------------|
| Authentication | JWT stored in HTTP-only cookies to prevent XSS-based token theft              |
| API Protection | Rate limiting at middleware level to prevent abuse and timing attacks         |
| Database       | NoSQL injection prevention via sanitization and schema validation             |
| Headers        | Secure HTTP headers using Helmet.js                                            |

---

## Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- OpenRouter API key

---

### 2. Backend Setup

cd backend  
npm install  

Create a .env file in the backend directory:

PORT=5000  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_high_entropy_secret  
OPENROUTER_API_KEY=your_api_key  

Run the backend server:

npm run dev  

---

### 3. Frontend Setup

cd frontend  
npm install  
npm start  

---

## Project Structure

noodle-ai/
├── frontend/
├── backend/
├── README.md

---

## Current Status

- Backend architecture completed  
- AI integration fully functional  
- Authentication system implemented  
- Tier-based system operational  
- Chat system with persistence implemented  
- Wellness tracking system implemented  
- Frontend base completed  
- UI/UX enhancements in progress  

---

## Future Enhancements

- Subscription and payment integration  
- Advanced AI response optimization  
- Improved UI with cinematic animations  
- Device-based session persistence  
- Production deployment and scaling  

---

## Conclusion

Noodle demonstrates the integration of AI systems, full-stack development, and secure backend engineering within a single platform. It reflects real-world implementation of authentication, rate limiting, scalable architecture, and AI-driven user interaction.

This project is designed as both a functional application and a demonstration of practical system design and engineering capability.