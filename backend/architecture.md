Backend Architecture Overview

1. High-level Stack
   Express.js (v5.1.0) + Node.js ES modules
   Socket.io (v4.8.1) for real-time chat rooms
   Supabase (PostgreSQL) persistent data
   Redis for cache/rate-limits/session state
   Pinecone vector DB for semantic doc search
   Optional Neo4j for graph relationships
   AI: Google Gemini 2.5 + Groq Llama 3.3 (70B) + RAG via web-search APIs
2. Core Responsibilities
   Authentication, user management, subscription/plan checks
   Document ingestion (PDF/DOCX/JSON/CSV/MD/PPTX/TXT) + embedding pipeline
   Semantic vector search over knowledge-base index
   Web search orchestration and synthesis mode
   Chat room collaboration + message history + SSE streaming
   Quota/rate limit enforcement per plan
   Error reporting (Telegram, logs), email service (Brevo), payments (Razorpay)
3. Data flows
   Ingest route → parser → chunker → Gemini embeddings → Pinecone insertion → DB metadata in Supabase
   Query route → intent analyzer → read doc chunks + web sources → Gemini/Groq generation → response + history log
   Chat room route → socket query + status events → synthesized answer streamed to clients
