🔍 EUREKA - Community-Powered Knowledge RAG Agent
EUREKA is a community-powered, public knowledge base agent that enables real-time collaboration and advanced AI document analysis.

Note: Only the EUREKA SDK is open-source. The core platform and infrastructure remain proprietary.

🚀 Why EUREKA?
EUREKA transforms how communities build and access reliable knowledge:

Structured knowledge base with topic hierarchies

Dual privacy mode: Public (peer-verified) or private (your docs only)

Real-time collaboration with teams or friends

Advanced AI analysis of large documents in minutes

📦 EUREKA SDK
The EUREKA SDK is open-source, allowing developers to:

Integrate EUREKA's capabilities into their applications

Create SDK implementations for other programming languages

Build custom solutions on top of EUREKA's knowledge base functionality

Installation
bash
npm install eureka-sdk
Basic Usage
javascript
import { EurekaClient } from 'eureka-sdk';

const client = new EurekaClient({
    apiKey: 'your-api-key-here'
});

// Upload documents
await client.uploadDocument(file, category, subCategory, visibility, title, name);

// Query knowledge base
const response = await client.queryDocument(documentId, query, queryType);
🛡️ License
SDK: AGPLv3 - Open source for community development and extension

Core Platform: Proprietary - Contains advanced AI algorithms and infrastructure

🔗 Links
Documentation

API Reference

Community Forum

EUREKA provides a freemium structure due to its advanced AI-powered architecture. The open-source SDK enables developers to extend EUREKA's capabilities while the core platform remains proprietary.