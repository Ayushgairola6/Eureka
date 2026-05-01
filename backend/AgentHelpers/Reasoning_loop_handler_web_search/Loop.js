import { error } from "console";

// export async function ExecuteTheReasoningLoop(intentResponse, context) {
//   // intentResponse: parsed JSON from IntentIdentifier LLM
//   const { user, question, messageId, plan_type } = context;

//   try {
//     // 1. Validate the response structure
//     if (!intentResponse || typeof intentResponse.search_web !== "boolean") {
//       return { error: "Invalid response from intent identifier", result: null };
//     }

//     // 2. Direct answer path — no search needed
//     if (!intentResponse.search_web) {
//       return {
//         answer: intentResponse.direct_answer,
//         favicon: null,
//         sources: [],
//         message: "Direct answer",
//       };
//     }

//     // 3. Search required — build queries and fetch results
//     const queries = intentResponse.queries
//       ? intentResponse.queries
//           .split(";")
//           .map((q) => q.trim())
//           .filter(Boolean)
//       : [];

//     if (queries.length === 0) {
//       throw new Error("Search requested but no queries generated");
//     }

//     // 4. Call your existing search pipeline (adjust to your actual function)
//     const { response: searchResponse, links: linksToFetch } =
//       await fetchSearchResults(
//         context.plan_type,
//         queries.join(","), // or queries array, depending on your API
//         context.user,
//         context.messageId
//       );

//     if (!searchResponse || !linksToFetch?.length) {
//       throw new Error("Search returned no results");
//     }

//     // 5. Process and clean web data for the final LLM
//     const cleanedData = await ProcessForLLM(
//       linksToFetch,
//       context.user,
//       context.question,
//       context.messageId,
//       null,
//       context.plan_type
//     );

//     if (!cleanedData || cleanedData.length === 0) {
//       throw new Error("Web processing failed");
//     }

//     const formattedWebResults = FormattForLLM(cleanedData);

//     // 6. Generate the final answer using your WebSearchDistributor prompt
//     const history = await GetChatsForContext(context.user); // memory
//     const finalPrompt = WEB_SEARCH_DISTRIBUTOR_PROMPT; // the one you already have

//     const userPrompt = `These are queries you generated: ${JSON.stringify(
//       queries
//     )}.
//     UserQuery: ${context.question}.
//     Chat history: ${JSON.stringify(history)}.
//     Web data: ${JSON.stringify(formattedWebResults)}.`;

//     const answerResult = await HandleInference(userPrompt, finalPrompt);
//     // or use GenerateResponse, whichever returns { error, result }

//     if (answerResult.error) {
//       throw new Error("Final answer generation failed");
//     }

//     return {
//       answer: answerResult.result,
//       favicon: formattedWebResults.favicons || [],
//       sources: formattedWebResults.urls || [],
//       message: "Results found",
//     };
//   } catch (error) {
//     console.error("ExecuteTheReasoningLoop error:", error);
//     // Notify error monitoring
//     notifyMe("Reasoning loop error", error);
//     return {
//       error: "Something went wrong while processing your request.",
//       result: null,
//     };
//   }
// }
