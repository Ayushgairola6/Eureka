import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Pinecone } from "@pinecone-database/pinecone";
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
import {
  CHAT_HISTORY_SUMMARIZER_PROMPT,
  SYNTHESIS_PROMPT,
} from "../Prompts/Prompts.js";
import { index, pc } from "./fileControllers.js";
import { redisClient } from "../CachingHandler/redisClient.js";
export const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

export const GenerateResponse = async (
  question,
  FormattedString,
  SYSTEM_PROMPT,
  user
) => {
  try {
    if (!question || !FormattedString || !SYSTEM_PROMPT) {
      return { error: "Some parameters are missing" };
    }

    // console.log(FormattedString);
    // const FinalString = SYSTEM_PROMPT + FormattedString;

    const result = await genAI.models.generateContent({
      model:
        user.PaymentStatus === false
          ? "gemini-2.5-flash-lite"
          : "gemini-2.0-pro-exp",
      contents: [
        { role: "model", parts: [{ text: "Sytem_prompt:" + SYSTEM_PROMPT }] },
        {
          role: "user",
          parts: [{ text: `userquery=${question}&Context${FormattedString}` }],
        },
      ],
      generationConfig: {
        temperature: user.PaymentStatus === false ? 0.5 : 1,
        topP: 0.95,
        topK: user.PaymentStatus === false ? 40 : 80,
        maxOutputTokens: user.PaymentStatus === false ? 2000 : 3000,
      },
      config: {
        thinkingConfig: {
          //if user is paid enable it else false
          includeThoughts: user.PaymentStatus === true ? true : false,
        },
      },
    });

    const responseText = result.text;
    if (!responseText) {
      await notifyMe(
        `Error while generating a response , the code execution results are these`,
        JSON.stringify(result.codeExecutionResult)
      );
      return { error: "The server is very busy , please try again !" };
    }
    // const responseText = FormattedString;
    // return { error: "Testing out the error fallback function" };
    return responseText;
  } catch (error) {
    console.error(error);
    return { error: "Error while generating a response by the model" };
  }
};

export const GenerateEmbeddings = async (file_content) => {
  try {
    if (!file_content || typeof file_content !== "string") {
      return { error: "Invalid content type" };
    }

    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: file_content,
      config: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    });

    // console.log(response.embeddings);
    if (!response.embeddings) {
      return { error: "Error while generating embeddings for chunks" };
    }

    return response.embeddings;
  } catch (error) {
    // console.error(error);
    return { error: "Error while Generated embeddings", error };
  }
};

const createIndex = async () => {
  try {
    const documentId = uuidv4();
    await pc.createIndexForModel({
      name: "knowledge-base-index",
      cloud: "aws",
      region: "us-east-1",
      embed: {
        model: "llama-text-embed-v2",
        fieldMap: { text: "text" },
      },
    });

    await pc.index("knowledge_base_index").configureIndex({
      indexed: [
        "category",
        "doc_id",
        "chunk_index",
        "email",
        "name",
        "upload_date",
      ],
    });
  } catch (error) {
    console.error(error);
  }
};
// createIndex()

//function that handles response generation for SynthesisMode
export const SynthesisResponseGenerator = async (
  ContextString,
  question,
  user,
  synthesisPrompt
) => {
  try {
    if (typeof ContextString !== "string") {
      return { error: "Model only accepts string as a source of information" };
    }
    const FinalString = `userQuery=${question} ContextBegins from here=>${ContextString}`;

    const result = await genAI.models.generateContent({
      model:
        user.PaymentStatus === false
          ? "gemini-2.5-flash-lite"
          : "gemini-2.0-pro-exp",
      contents: [
        {
          role: "model",
          parts: [{ text: "System Instructions: " + synthesisPrompt }],
        },
        { role: "user", parts: [{ text: FinalString }] },
      ],
      generationConfig: {
        temperature: user.PaymentStatus ? 0.7 : 0.3, // Higher temp for pro reasoning
        topP: 0.95,
        maxOutputTokens: user.PaymentStatus ? 2000 : 400, // Pro needs more tokens for CoT
        // If using a Thinking-enabled model:
        thinkingConfig: {
          includeThoughts: user.PaymentStatus, // Boolean
        },
      },
    });

    const responseText = result.text;
    if (!responseText) {
      console.error(result);
      await notifyMe(
        `Error while generating a response , the code execution results are these`,
        JSON.stringify(result)
      );
      return { error: "The server is very busy , please try again !" };
    }
    // return { error: "Testing out the error fallback function" };
    return responseText;
  } catch (error) {
    console.error(error);
    await notifyMe(
      "AN error occured in the sysnthesis response geenrator",
      error
    );
  }
};

export const HandleSummarizationOfChats = async (room_id, chatsArray, user) => {
  try {
    if (chatsArray.length === 0 || !Array.isArray(chatsArray)) {
      return { message: "There were no messages in the array" };
    }
    const chatIndex = await pc.index("room_chat_history");
    let Result = "";
    chatsArray.forEach(
      (li, index) =>
        (Result += `sent_by=${li.users}&sent_at=${li.sent_at}main_content=${li.message}`)
    ); //create the contexts string
    // const summmary = await GenerateResponse(
    //   "Summarize this data",
    //   Result,
    //   CHAT_HISTORY_SUMMARIZER_PROMPT,
    //   user.PaymentStatus
    // );

    // console.log(summmary);
    const summmary = `
On December 7, 2025, at 8:59 PM, there were thr
ee initial messages: "This is the first message
," "This is the second message," and "And this
is the third and final message." At 9:15 PM on
the same day, a "new 4th message going in the c
ache" was sent.

On December 7, 2025, at 11:24 PM, a message sta
ted that the provided documents and search resu
lts lacked specific client data, sales, and pro
fit information, making it impossible to analyz
e documents, draft a plan to boost sales and pr
ofit, or identify market trends. The sender req
uested the client's data for further assistance
.

On December 7, 2025, at 11:30 PM, an "Executive
 Summary" and "Detailed Analysis" were provided
 concerning Nebula AI Systems.
*   **Nebula AI Systems Q3 2024 Performance Hig
hlights:**
    *   Total Revenue: $1.25 Billion (Up 45% Yo
Y)
    *   Net Income: $320 Million
    *   Operating Margin: 25.6%
    *   R&D Expenditure: $400 Million (Focus on
 Quantum integration)
*   **Key Updates:**
    *   "Hyperion-X" chip secured contracts wit
h three major cloud providers.
    *   Strategic partnership with semiconducto
r manufacturers in Taiwan for supply chain secu
rity.
    *   New research facility established in Au
stin, Texas.
*   **Outlook:**
    *   Q4 revenue guidance increased to $1.5 B
illion.
    *   $50 Million stock buyback program plann
ed for early 2025.
*   **Risk Factors:**
    *   Global silicon shortages.
    *   EU scrutiny on AI safety protocols.
*   **Plan to Boost Sales and Profit (Client Sp
ecific):** This section reiterated the lack of
specific client data, preventing analysis or pl
an drafting.

On December 8, 2025, at 1:03 PM, an "Executive
Summary" and "Detailed Analysis" were provided
for GreenLeaf Logistics.
*   **GreenLeaf Logistics Q3 2024 Financial Per
formance:**
    *   Total Revenue: $850 Million (Up 5% YoY)
    *   Net Income: $65 Million
    *   Operating Margin: 7.8% (Impacted by fue
l costs)
    *   Capital Expenditures: $120 Million (For
 electric truck fleet acquisition)
*   **Key Updates:**
    *   30% electric fleet conversion rate achi
eved.
    *   CEO highlighted cost-cutting measures.
    *   Secured a 5-year exclusivity deal with
a major organic food retailer.
*   **Risk Factors:**
    *   Fuel price volatility.
    *   Upcoming union negotiations in November
 2024.
*   **Outlook for Q4 2024:**
    *   Revenue projection of $860 Million.
    *   Emphasis on operational efficiency.
*   **Market Context:** The automotive industry
's shift towards electrification and sustainabi
lity aligns with GreenLeaf Logistics' strategy.

On December 8, 2025, at 1:03 PM, a synthesized
report combined information on Nebula AI System
s and GreenLeaf Logistics.
*   **Comparative Overview:**
    *   **Nebula AI Systems:** Q3 2024, $1.25 B
illion Revenue (45% YoY), $320 Million Net Inco
me, 25.6% Operating Margin, "Hyperion-X" units,
 focus on hardware integration and quantum inte
gration, partnership for supply chain, Austin f
acility, Q4 guidance $1.5 Billion, risks includ
e silicon shortages and AI safety scrutiny. Sou
rce: Nebula_AI_Q3_2024_Report.txt.txt.
    *   **GreenLeaf Logistics:** Q3 2024, $850
Million Revenue (5% YoY), $65 Million Net Incom
e, 7.8% Operating Margin (impacted by fuel cost
s), "Eco-Freight" solutions, focus on sustainab
ility and operational efficiency, electric flee
t acquisition, Q4 projection $860 Million, risk
s include fuel volatility and union negotiation
s. Source: GreenLeaf_Logistics_Q3_2024_Report.t
xt.txt. Market context: Automotive industry shi
ft to electrification and sustainability.
*   **Key Insights:** Nebula AI Systems shows r
apid growth driven by AI hardware, while GreenL
eaf Logistics shows moderate steady growth leve
raging sustainability. The automotive industry
trend supports GreenLeaf's strategy. The lack o
f specific client data was reiterated.

On December 8, 2025, at 11:47 PM, a research do
cument titled "Adaptive Syndrome Measurements f
or Enhanced Error Mitigation in Noisy Intermedi
ate-Scale Quantum (NISQ) Processors" by Dr. Ele
na Vovan, J. Smith, and A. K. Gupta was summari
zed.
*   **Problem:** Qubit fidelity degradation due
 to decoherence and crosstalk in scaling quantu
m hardware. NISQ devices have high error rates
(approx. $10^{-3}$ per gate).
*   **Solution:** An adaptive protocol for QEC
that dynamically adjusts syndrome measurement f
requency based on real-time noise characterizat
ion.
*   **Methodology:** Used FPGAs for real-time n
oise monitoring and an "Adaptive-17 code" versu
s a standard "Surface-17 code."
*   **Key Findings:**
    *   Latency: 20 nanoseconds.
    *   Fidelity Improvement: $1.4 \times$ in B
ell-state preparation.
    *   Error Rate Reduction: Approximately 18%
 logical error rate reduction.
    *   Scalability: Logarithmic scaling with q
ubit count.
*   **Conclusion:** Real-time adaptation is mor
e efficient than repetitive syndrome extraction
. Future work includes ML agents for proactive
noise prediction.
*   **Keywords:** Quantum Computing, Error Corr
ection, NISQ, Transmon Qubits, Adaptive Control
. Source: Quantum Mechanics research papers 1.m
d.

On December 8, 2025, at 11:52 PM, a message sta
ted, "So everyone in this room , this is the in
formation that i was able to gather until now."

On December 8, 2025, at 11:53 PM, a concluding
remark was made: "Make sure you guys also read
the full details and do your own parts with pre
cision."`;
    if (!summmary || summmary.error) {
      return { message: "An error occured while creating a summary" };
    }
    const history_id = uuidv4();
    try {
      await chatIndex.upsertRecords([
        {
          id: history_id,
          room_id: room_id,
          summary: summmary,
          created_at: new Date().toISOString().split("T")[0],
        },
      ]);
    } catch (upserterror) {
      console.error("Upsert error:", upserterror);
      return { message: "An error occured while upserting chatsummary" };
    }
    const summaryKey = `room_id=${room_id}'s_summarized_history`;
    const summaryExists = await redisClient.exists(summaryKey);
    if (summaryExists) {
      const summaryArray = await redisClient.get(summaryKey);
      const parsedSummary = JSON.parse(summaryArray);
      parsedSummary.push(summmary);
      //proceed with 2 operations at once
      const multi = await redisClient
        .multi()
        .set(summaryKey, JSON.stringify(parsedSummary))
        .expire(summaryKey, 4000)
        .exec();
    }
  } catch (chatSummarizationError) {
    await notifyMe(
      "An error occured in chatHistory summarization",
      chatSummarizationError
    );
    return { message: "Something went wrong" };
  }
};

export const FindIntent = async (required_prompt, query) => {
  try {
    if (
      !required_prompt ||
      typeof required_prompt !== "string" ||
      !query ||
      typeof query !== "string"
    ) {
      console.error("INvalid parameters");
      return { error: "Invalid parameters for FindIntent" };
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        { role: "model", parts: [{ text: required_prompt }] },
        { role: "user", parts: [{ text: query }] },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 20,
        maxOutputTokens: 300,
      },
    });

    const responseText = result?.text;
    console.log(
      responseText,
      "The response string generated by FindIntent method"
    );
    if (!responseText) {
      await notifyMe("Error while generating intent", JSON.stringify(result));
      return { error: "Error while finding user intent" };
    }

    return responseText;
  } catch (error) {
    console.error("FindIntent error:", error);
    await notifyMe("FindIntent exception", error);
    return { error: "Exception while finding user intent" };
  }
};

export function FilterIntent(resultstring) {
  const lists = resultstring.split(";");

  const queries = [];
  if (lists?.length > 0) {
    lists.forEach((string) => {
      queries.push(string);
    });
  }
  return queries;
}
