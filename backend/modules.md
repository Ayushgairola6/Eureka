Modules and File Mapping
Routers (request entry points)
AuthRouter.js: auth endpoints, user account actions, Google OAuth
ChatsRouter.js: chat room actions, history, document QA, synthesis
filerouter.js: upload + document queries + SSE + synthesis mode
ApiRouter.js: API key management
ReviewRouter.js: feedback endpoints
Verification_modeRouter.js: verification/analysis endpoints
sdkRouter.js: SDK usage endpoints
Controllers (business logic)
AuthController.js: register/login/logout, JWT generation, reset flow
fileControllers.js: FileUploadHandle, GetPublicRecords, query vector data, delete docs
ChatRoomController.js: Join room, GetRoomChatHistory, room document query
ModelController.js: GenerateResponse, GenerateEmbeddings, synthesis and summarization
GroqInferenceController.js: fast structured inference (Groq)
FeaturesController.js: session history + formatting + web research logic
UserCreditLimitController.js: quota/rate enforcement middleware
API_controller.js: API key creation/retrieval
GoogleAuthController.js: OAUTH routes and callbacks
WebSearchOrchrestration.js: tool orchestration for web search loops
supabaseHandler.js: Supabase client initialization
Middlewares
AuthMiddleware.js: JWT verify/refresh + plan check + permission gating
ApiKeyValidator.js: API key authorization + request throttling
StreamingMiddleware.js: SSE token generator/validator
Service Handlers
telegramHandler.js: send critical alerts to Telegram
WebCrawler.js: crawl + filter web search results (Serper)
WebSearchHandler.js: Tavily web search calls
EmailTemplates.js: email templates and send function
RazorPayHandler.js: order creation + plan payment metadata management
redisClient.js: Redis wrapper for caching tokens, docs, chat flow
Synthesis Engine (multi-phase AI workflow)
Identifier.js: query classification + context classifier + tool selection
phase1_context.js: gather docs/KB context for question
phase2_action.js: execute searches and retrieval steps
PreprocessingHandler.js: preprocess doc metadata, orchestrate pipeline
helper_functions.js: helper utilities (doc ownership checks, memory store)
tools.js: registry of tool interface functions
Parsers and Utils
FilerParser.js: multi-format file parsing + chunking
websocketsHandler.js: Socket.io init, JWT-auth socket connect, room event emits
service_worker.js: cron-based keepalive & background tasks
