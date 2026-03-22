Data Layer and Storage Mapping
Supabase data tables
users: auth profile, plan flags, feature toggles
API_KEYS: hashed SDK keys + user link
Contributions: uploaded file metadata and ownership details
Conversation_History: Q&A logs from user queries
Tokens: refresh tokens for user sessions
notifications: user notification entries
chatrooms: room info + participants
room_messages: messages within room contexts
Vector DB (Pinecone)
index: knowledge-base-index
stores: per-document chunk embedding vectors + metadata
query style: semantic similarity (cosine) for relevant chunk retrieval
Cache (Redis)
session tokens, rate limit keys, user file list cache
chat history cache, document metadata cache
keys: e.g. rate_limit:<...>, user:<...>, doc:<UUID>
Graph DB (Neo4j, optional)
relationship modeling for system data (optional)
