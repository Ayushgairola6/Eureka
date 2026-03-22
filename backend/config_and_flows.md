Config and Core Request Flows
Important env variables
SUPABASE_PROJECT_URL, SUPABASE_SERVICE_API_KEY
REDIS_STRING
PINECONE_DB_API_KEY, PINECONE_INDEX_NAME
GROQ_INFERENCE_KEY, GEMINI_API_KEY
JWT_SECRET, REFRESH_TOKEN_SECRET
SERPER_WEB_API, TAVILY_WEB_SEARCH_API_KEY
RAZORPAY_API_KEY, RAZORPAY_KEY_SECRET
BREVO_USER, BREVO_SMTP_KEY
PORT, NEO4J_URI (optional)
AGENT_REQUESTS_PER_MINUTE, USER_FREE_QUOTA_LIMIT
TELEGRAMTOKEN, MY_CHAT_ID
Typical request flows
upload + document QA
POST /api/upload-pdf → AuthMiddleware verify token → fileControllers.FileUploadHandle
parse (FilerParser) → chunk → ModelController.GenerateEmbeddings → Pinecone insert
metadata save in Supabase Contributions
query vector docs
POST /api/ask-pdf → StreamingMiddleware token → fileControllers.GetPrivateDocResultss
fetchSearchResults from Pinecone → ModelController.GenerateResponse → SSE stream
chat room synthesis
POST /api/method/synthesis → AuthMiddleware → Synthesis/Identifier.IdentifyRequestInputs
phase1_context, phase2_action, ModelController.GenerateResponse
WebSearchOrchrestration if external data needed
web search + intent route
POST /api/query/web-search → WebSearchOrchrestration.HandleIntentIdentification
GetDataFromSerper, WebSearchHandler, ModelController synthesis
persist in Conversation_History
