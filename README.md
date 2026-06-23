# AI-Powered Chat Application with RAG & Agentic AI

## 📌 Project Overview

This project is a full-stack AI-powered chat application built using a microservices architecture. It enables users to interact with advanced AI models, upload PDF documents, and ask questions directly from uploaded content using Retrieval-Augmented Generation (RAG). The system integrates Agentic AI using AGNO, allowing intelligent decision-making on when document retrieval is required before generating responses.

The application supports authentication, conversation management, persistent chat history, streaming responses, PDF-based question answering, semantic search, and vector-based document retrieval.

---

## 🚀 Features

### Authentication & User Management
- User Registration & Login
- JWT-based Authentication
- Protected Routes
- Session Management

### Chat Features
- Real-time AI Chat
- Conversation History
- Multiple Chat Threads
- Rename & Delete Threads
- Auto-generated Chat Titles
- Streaming AI Responses

### Document Intelligence
- PDF Upload Support
- PDF Text Extraction
- Smart Chunking with Overlap
- Semantic Embedding Generation
- Vector Search
- Retrieval-Augmented Generation (RAG)
- Multi-document Querying

### Agentic AI
- AGNO Agent Integration
- Intelligent Tool Calling
- Retrieval Decision Making
- Context-Aware Responses

### Memory & Persistence
- MongoDB Chat History
- Persistent Conversations
- User-Specific Thread Storage

---

## 🏗️ System Architecture

```text
┌──────────────────────────┐
│       Frontend UI        │
│        Next.js           │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       API Gateway        │
│        Port 5003         │
└────────────┬─────────────┘
             │
 ┌───────────┼───────────┬───────────┐
 ▼           ▼           ▼           ▼

Auth       Chat         AI         RAG
5000       5001        5002       5004

                         │
                         ▼
                 AGNO Service
                  FastAPI 8000

                         │
                         ▼
                    OpenRouter

                         │
                         ▼
                   Vector Search
```

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React.js
- TypeScript
- Tailwind CSS
- NextAuth

### Backend
- Node.js
- Express.js
- FastAPI
- Python

### Databases
- MongoDB
- SQLite

### AI & Machine Learning
- OpenRouter
- AGNO
- HuggingFace Transformers
- Embedding Models

### RAG Components
- pdf-parse
- Semantic Chunking
- Vector Search
- Cosine Similarity Retrieval

---

## 📂 Project Structure

```text
project-root/

├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   └── styles/
│
├── auth-service/
│
├── chat-service/
│
├── ai-service/
│
├── rag-service/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── uploads/
│
├── agno-service/
│
└── api-gateway/
```

---

## ⚙️ Microservices

### 1. Auth Service (Port 5000)

Responsible for:
- User Registration
- User Login
- JWT Authentication
- Authorization

---

### 2. Chat Service (Port 5001)

Responsible for:
- Thread Management
- Message Storage
- Conversation History
- Streaming Responses

---

### 3. AI Service (Port 5002)

Responsible for:
- OpenRouter Integration
- AI Response Generation
- Model Routing

---

### 4. API Gateway (Port 5003)

Responsible for:
- Centralized Routing
- Request Forwarding
- Service Communication

---

### 5. RAG Service (Port 5004)

Responsible for:
- PDF Upload Handling
- PDF Parsing
- Text Extraction
- Smart Chunking
- Embedding Generation
- Semantic Retrieval
- Context Retrieval

---

### 6. AGNO Service (Port 8000)

Responsible for:
- Agentic AI Workflows
- Tool Calling
- Retrieval Decision Making
- Context Routing

---

## 🔄 RAG Workflow

```text
PDF Upload
     │
     ▼
Text Extraction
     │
     ▼
Smart Chunking
     │
     ▼
Embedding Generation
     │
     ▼
Vector Storage
     │
     ▼
User Query
     │
     ▼
Semantic Search
     │
     ▼
Relevant Chunks
     │
     ▼
AGNO Agent
     │
     ▼
Final Response
```

---

## 📸 Screenshots

### Login Page
![Login Page](screenshots/login-page.png)

### Chat Interface
![Chat Interface](screenshots/chat-home.png)

### PDF Upload Feature
![PDF Upload](screenshots/pdf-upload.png)

### RAG-Based Response
![RAG Response](screenshots/rag-response.png)

### Streaming AI Response
![Streaming Response](screenshots/streaming-response.png)

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/your-repository.git
cd your-repository
```

### Install Frontend

```bash
cd frontend
npm install
```

### Install Auth Service

```bash
cd auth-service
npm install
```

### Install Chat Service

```bash
cd chat-service
npm install
```

### Install AI Service

```bash
cd ai-service
npm install
```

### Install RAG Service

```bash
cd rag-service
npm install
```

### Install AGNO Service

```bash
cd agno-service
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

Create a `.env` file for each service.

Example:

```env
OPENROUTER_API_KEY=your_openrouter_key

JWT_SECRET=your_jwt_secret

MONGO_URI=your_mongodb_connection_string

NEXTAUTH_SECRET=your_nextauth_secret

NEXTAUTH_URL=http://localhost:3000
```

---

## ▶️ Running the Application

### Start Auth Service

```bash
npm run dev
```

### Start Chat Service

```bash
npm run dev
```

### Start AI Service

```bash
npm run dev
```

### Start RAG Service

```bash
npm run dev
```

### Start AGNO Service

```bash
uvicorn main:app --reload
```

### Start Frontend

```bash
npm run dev
```

---

## 🎯 Key Achievements

- Developed a complete Microservices-Based AI Platform.
- Implemented Retrieval-Augmented Generation (RAG).
- Built Agentic AI workflows using AGNO.
- Added PDF-based Question Answering.
- Enabled Streaming Responses.
- Implemented Persistent Memory with MongoDB.
- Added Semantic Search & Vector Retrieval.
- Designed a modern ChatGPT-inspired User Interface.

---

## 📈 Future Enhancements

- ChromaDB Integration
- Qdrant Vector Database
- Multi-Agent Collaboration
- Web Search Agent
- OCR for Scanned PDFs
- Voice Input Support
- Multi-modal AI Capabilities
- Source Citation Highlighting

---

## 👩‍💻 Author

**Vaishnavi Singh N**

MCA, PES University

Full Stack Developer | AI Enthusiast | Data Engineer

GitHub: https://github.com/vaishnavisingh1220

LinkedIn: https://www.linkedin.com/in/vaishnavi-singh-7b4773287
