import { redisClient } from "../CachingHandler/redisClient.js";
import dotenv from 'dotenv';
dotenv.config();
// check if the key exists delete if it exisits
export async function CheckAndExpireThreadId(thread_id, user_id) {
    try {
        if (!thread_id || typeof thread_id !== 'string') return { error: "Invalid research threadID", message: null };
        const key = `user:${user_id}_created_at:${Date.now()}`

        const hasKey = await redisClient.get(key);
        if (hasKey) {
            await redisClient.multi().del(key).exec();
            return { error: null, message: "Updated the queue" }
        }
    } catch (err) {
        return { error: err, message: null }
    }
}

export async function FilterHighValueSources(question, finalQueries, allDiscoveredLinks) {
    // 1. Cleaned up System Prompt (Fixed weird spaces in XML tags like </user_question >)
    const SOURCE_FILTRATION = `You are the "Source Quality Filter," an expert research analyst working for a deep-web research AI. 
YOUR MISSION: You will be provided with a user's core research question, the specific search queries used, and a raw list of search results (URLs, titles, and snippets). Your job is to act as a strict bouncer: evaluate every link and select ONLY the high-value, most authoritative, and deeply relevant sources for deep scraping. 
EVALUATION CRITERIA: 
- Only reject urls that are behind a strict paywall or authentication wall.
`
    // 2. Define the JSON Schema for Structured Output
    // This forces the LLM to output EXACTLY this structure, preventing parsing errors.
    const sourceFilterSchema = {
        type: "object",
        properties: {
            selected_sources: {
                type: "array",
                description: "Array of high-value sources selected for deep scraping.",
                items: {
                    type: "object",
                    properties: {
                        url: { type: "string", description: "The exact URL from the input." },
                        title: { type: "string", description: "The title of the page." },
                        reason: { type: "string", description: "A brief 1-sentence explanation of why this source is highly valuable." }
                    },
                    required: ["url", "title", "reason"],
                    additionalProperties: false // Strict mode: no extra fields allowed
                }
            },
            rejected_count: {
                type: "integer",
                description: "The number of links you decided to drop."
            }
        },
        required: ["selected_sources", "rejected_count"],
        additionalProperties: false // Strict mode: no extra fields allowed at the root
    };

    // 3. Format the User Message cleanly with XML tags
    const user_message_content = `
<user_question>
${question}
</user_question>

<search_queries_used>
${finalQueries.join(', ')}
</search_queries_used>

<raw_search_results>
${JSON.stringify(allDiscoveredLinks, null, 2)}
</raw_search_results>
    `;

    const messages = [
        { role: "system", content: SOURCE_FILTRATION },
        { role: "user", content: user_message_content }
    ];

    // 4. Construct the Payload with Structured Output Schema
    // We use the standard OpenAI-compatible 'response_format' with 'json_schema'
    const payload = {
        model: "stepfun-ai/step-3.7-flash",
        messages: messages,
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "source_filter_schema",
                strict: true,
                schema: sourceFilterSchema
            }
        }, temperature: 0.1, stream: false, repetition_penalty: 1.05
    };

    try {
        const response = await fetch(`${process.env.BASE_INFERENCE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", Authorization: `Bearer ${process.env.NVIDIA_KEY}`
            },
            body: JSON.stringify(payload), // FIXED: You were passing undefined 'data' here!
        });

        if (!response.ok) {
            console.error(response)
            throw new Error(`Inference API HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // 5. Extract the content 
        // Note: Adjust this extraction path based on how your specific HF Space formats its response
        const content = result.choices?.[0]?.message?.content || result.content || result;

        // If the API returns a string instead of an already-parsed JSON object, parse it
        const parsedData = typeof content === 'string' ? JSON.parse(content) : content;

        return {
            error: null,
            sources: parsedData.selected_sources || [],
            rejected_count: parsedData.rejected_count || 0
        };

    } catch (err) {
        console.error("FilterHighValueSources Error:", err);
        return { error: err.message || err, sources: [] };
    }
}