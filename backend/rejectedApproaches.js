// OPTIMIZED AGENT LOOP CURRENTLY NOT BEING USED BECAUSE OF RESOURCE CONSTRAINTS

// export const PostTypeWebSearch = async (req, res) => {
//   try {
//     const user_id = req.user.user_id;
//     if (!user_id)
//       return res.status(401).send({ message: "Please login to continue" });

//     const { question, MessageId, userMessageId, web_search_depth } = req.body;
//     if (
//       !question ||
//       typeof question !== "string" ||
//       !MessageId ||
//       typeof MessageId !== "string" ||
//       !userMessageId ||
//       typeof userMessageId !== "string" ||
//       !web_search_depth ||
//       typeof web_search_depth !== "string"
//     )
//       return res.status(404).send({
//         message:
//           "Some parameters are missing,this is a server side issue please wait till we resolve this problem.",
//       });

//     // check user plan status
//     const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
//       user_id
//     );

//     //if the user is not paid or the paid staus is not even available
//     if (status === false || error || !plan_type) {
//       return res.status(400).send({
//         message:
//           "There is something wrong with your account please contact our support at support@antinodeai.space to invoke a problem ticket.",
//       });
//     }

//     // if the user is on free plan and is asking for deep_web_search
//     if (
//       plan_type === "free" &&
//       plan_status === "active" &&
//       web_search_depth === "deep_web"
//     ) {
//       return res.status(400).send({
//         message:
//           "This feature is only available for pro members ,if you want to surf the deep web get our premium subscriptio to enjoy research with deep web results.",
//       });
//     }

//     // check the quota status of the user
//     const UpdateState = await ProcessUserQuery(req.user, "web_search");

//     // if user has reached the
//     if (UpdateState?.status === false) {
//       return res.status(400).send({
//         Answer:
//           "You have exhausted your monthly quota please wait till next month or get our premium pass to enjoy unlimited research",
//         message:
//           "You have exhausted your monthly quota please wait till next month or get our premium pass to enjoy unlimited research",
//         favicons: { MessageId, icon: [] },
//       });
//     }

//     const history = [];
//     const pastConversation = await GetChatsForContext(req.user);
//     if (!pastConversation || pastConversation.length === 0) {
//       history.push(`Failed to get session chat history`);
//     } else {
//       history.push(pastConversation?.flat());
//     }

//     const message = {
//       id: userMessageId,
//       sent_by: "You",
//       message: { isComplete: true, content: question },
//       sent_at: currentTime,
//     };

//     CacheCurrentChat(message, req.user); //update the cache

//     // handle the agentic loop

//     const Answer = await WebSerchAgentLoop(
//       history,
//       question,
//       req.user,
//       plan_type,
//       null,
//       ["no context"],
//       0,
//       MessageId
//     ); //trigger the agentic loop

//     if (Answer?.error) {
//       return res.status(400).json({
//         message:
//           "The AI models are overloaded right now please wait a bit before trying again.",
//       });
//     }

//     if (!Answer?.message && !Answer?.results) {
//       return res.status(400).json({
//         message:
//           "The AI models are overloaded right now please wait a bit before trying again.",
//       });
//     }

//     const AiMessage = {
//       id: MessageId,
//       sent_by: "AntiNode", //sent by the user
//       message: {
//         isComplete: true,
//         content: Answer?.message,
//       },
//       sent_at: currentTime,
//     };

//     CacheCurrentChat(AiMessage, req.user);
//     const StoreChats = await StoreQueryAndResponse(
//       user_id,
//       question,
//       Answer?.message
//     );
//     if (StoreChats.error) {
//       notifyMe(`Error while storing response history ${StoreChats.error}`);
//     }

//     // find the update the chats
//     const FormattedFavicon = {
//       MessageId,
//       icon: Answer?.results?.web_search_results?.favicons || [],
//       url: Answer?.results?.web_search_results?.urls | [], //favicon array from the web search
//     };

//     // send the final response to the user
//     return res.send({
//       Answer: Answer?.message,
//       message: "Results found",
//       favicon: FormattedFavicon,
//     });
//   } catch (err) {
//     console.error(err, "erro in the web search controller\n");
//     notifyMe(
//       "An error occured in the postTypewebsearch controller function filecontroller.js line 1204",
//       err
//     );

//     return res.status(500).send({
//       message:
//         "This is a server side error please wait while we are fixing this problem, thanks for your patience.",
//     });
//   }
// };

// older processllm scraper function
// export const ProcessForLLM = async (
//   links,
//   user,
//   userQuery,
//   MessageId,
//   room_id,
//   plan_type
// ) => {
//   try {
//     const dataset = [];
//     turndown.remove(["img", "iframe", "script", "style", "noscript"]);

//     const validLinks = filterResearchLinks(links);

//     const config = new Configuration({
//       persistStorage: false,
//       storageClient: new MemoryStorage({ persistStorage: false }),
//     });

//     log.setLevel(log.LEVELS.OFF);
//     const crawler = new CheerioCrawler(
//       {
//         minConcurrency: 20,
//         maxConcurrency: 50,
//         maxRequestRetries: 0,
//         requestHandlerTimeoutSecs: 10,
//         useSessionPool: false,
//         failedRequestHandler: ({ request }) => {},
//         async requestHandler({ request, body, $ }) {
//           if (room_id) {
//             EmitEvent(room_id, "query_status", {
//               MessageId,
//               status: {
//                 message: "reading_links",
//                 data: [`Reading: ${new URL(request.url).hostname}`],
//               },
//             });
//           } else {
//             EmitEvent(user.user_id, "query_status", {
//               MessageId,
//               status: {
//                 message: "reading_links",
//                 data: [`Reading: ${new URL(request.url).hostname}`],
//               },
//             });
//           }

//           if (body.length < 500) return;

//           const { document } = parseHTML(body);

//           const reader = new Readability(document);
//           const article = reader.parse();

//           if (article && article.content) {
//             const markdown = turndown.turndown(article.content);

//             if (markdown.length < 200) return;
//             const wordCount = article?.textContent.split(/\s+/).length;
//             const cleanedMarkdown = markdown
//               .replace(/\[.*?\]\(.*?\)/g, "")
//               .replace(/#{1,6}\s/g, "")
//               .replace(/\n{3,}/g, "\n\n")
//               .trim();
//             let ProcessedPage;
//             try {
//               ProcessedPage =
//                 // plan_type === "free"
//                 extractHighValueChunks(cleanedMarkdown, userQuery, 5000);
//             } catch (pageerror) {
//               // console.error(pageerror);
//               return;
//             }

//             // : await HandleContextFiltering(cleanedMarkdown, userQuery);

//             // Guard against null result
//             if (!ProcessedPage || !ProcessedPage?.content) return;

//             const object = {
//               title: article.title,
//               url: request?.url,
//               favicon: `https://www.google.com/s2/favicons?domain=${
//                 new URL(request.url).hostname
//               }&sz=64`,
//               markdown: ProcessedPage?.content,
//               score: ProcessedPage?.score,
//             };

//             if (room_id) {
//               EmitEvent(room_id, "query_status", {
//                 MessageId,
//                 status: {
//                   message: "Cleaning_Context",
//                   data: [ProcessedPage.content.slice(0, 1000)],
//                 },
//               });
//             } else {
//               EmitEvent(user.user_id, "query_status", {
//                 MessageId,
//                 status: {
//                   message: "Cleaning_Context",
//                   data: [ProcessedPage.content.slice(0, 1000)],
//                 },
//               });
//             }

//             dataset.push(object);
//           }
//         },
//       },
//       config
//     );

//     await crawler.run(validLinks);
//     return dataset;
//   } catch (err) {
//     notifyMe("An error in the process llm handler\n", err);
//     return [];
//   }
// };

// export async function HandleIntentIdentification(question, plan_type, history) {
//   try {
//     const historyString = history.length
//       ? history
//           .map(
//             (m) =>
//               `responded_at:${m.created_at}&your_response:${m.AI_response}&user_query:${m.question}`
//           )
//           .join("\n")
//       : "No previous conversation.";

//     const promptWithHistory = IntentIdentifier + historyString;

//     const IdentifiedIntent = await HandleInference(
//       `user_prompt=${question}&plan_type=${plan_type}`,
//       promptWithHistory
//     );

//     if (
//       !IdentifiedIntent ||
//       IdentifiedIntent?.error ||
//       !IdentifiedIntent?.result
//     ) {
//       return { error: "Failed to generate a response", data: null };
//     }
//     // console.log(IdentifiedIntent);
//     let parsed;
//     try {
//       parsed = IdentifiedIntent.result;
//     } catch (e) {
//       console.error("Failed to parse intent JSON", e);
//       return { error: "Failed to parse intent", data: null };
//     }

//     if (typeof parsed.search_web !== "boolean") {
//       return { error: "Invalid intent structure", data: null };
//     }

//     const queries =
//       parsed.search_web && parsed.queries
//         ? parsed.queries
//             .split(";")
//             .map((q) => q.trim())
//             .filter(Boolean)
//         : [];

//     return {
//       error: null,
//       data: {
//         search_web: parsed.search_web,
//         direct_answer: parsed.search_web ? "" : parsed.direct_answer || "",
//         queries,
//       },
//     };
//   } catch (error) {
//     console.error("intent_indentificaiton_error", error);
//     return { error: "Failed while processin something", data: null };
//   }
//   // Format history as a readable string – adjust to your actual message shape
// }
// export const PostTypeWebSearch = async (req, res) => {
//   try {
//     const user_id = req.user.user_id;
//     if (!user_id)
//       return res.status(401).send({ message: "Please login to continue" });

//     const { question, MessageId, userMessageId, web_search_depth } = req.body;
//     if (
//       !question ||
//       typeof question !== "string" ||
//       !MessageId ||
//       typeof MessageId !== "string" ||
//       !userMessageId ||
//       typeof userMessageId !== "string" ||
//       !web_search_depth ||
//       typeof web_search_depth !== "string"
//     )
//       return res.status(404).send({
//         message:
//           "Some parameters are missing,this is a server side issue please wait till we resolve this problem.",
//       });

//     // check user plan status
//     const { status, error, plan_type, plan_status } = await CheckUserPlanStatus(
//       user_id
//     );

//     if (status === false || error || !plan_type) {
//       return res.status(400).send({
//         message:
//           "There is something wrong with your account please contact our support at support@antinodeai.space to invoke a problem ticket.",
//       });
//     }

//     // if the user is on free plan and asking for deep_web_search
//     if (
//       plan_type === "free" &&
//       plan_status === "active" &&
//       web_search_depth === "deep_web"
//     ) {
//       return res.status(400).send({
//         message:
//           "This feature is only available for pro members ,if you want to surf the deep web get our premium subscription to enjoy research with deep web results.",
//       });
//     }

//     // check quota
//     const UpdateState = await ProcessUserQuery(req.user, "web_search");
//     if (UpdateState?.status === false) {
//       return res.status(400).send({
//         Answer:
//           "You have exhausted your monthly quota please wait till next month or get our premium pass to enjoy unlimited research",
//         message:
//           "You have exhausted your monthly quota please wait till next month or get our premium pass to enjoy unlimited research",
//         favicons: { MessageId, icon: [] },
//       });
//     }

//     // check quota ...
//     const oldConvo = await GetChatsForContext(req.user, plan_type);
//     const old_history = oldConvo && oldConvo.length ? oldConvo : [];

//     // --- Intent Identification (with history) ---
//     const Intent = await HandleIntentIdentification(
//       question,
//       plan_type,
//       old_history
//     );
//     const { search_web, direct_answer, queries } = Intent.data;

//     // ---------- DIRECT ANSWER PATH ----------
//     if (!search_web && direct_answer) {
//       // Cache user message
//       const userMsg = {
//         id: userMessageId,
//         sent_by: "You",
//         message: { isComplete: true, content: question },
//         sent_at: currentTime,
//       };
//       await CacheCurrentChat(userMsg, req.user);

//       // Cache AI response
//       const aiMsg = {
//         id: MessageId,
//         sent_by: "AntiNode",
//         message: { isComplete: true, content: direct_answer },
//         sent_at: currentTime,
//       };
//       await CacheCurrentChat(aiMsg, req.user);

//       // Store in DB
//       const storeResult = await StoreQueryAndResponse(
//         user_id,
//         question,
//         direct_answer
//       );
//       if (storeResult.error) {
//         await notifyMe(`Error storing direct answer: ${storeResult.error}`);
//       }

//       // No web results, so empty favicons/sources
//       return res.send({
//         Answer: direct_answer,
//         message: "Direct answer",
//         favicon: { MessageId, icon: [], url: [] },
//       });
//     }

//     // ---------- SEARCH PATH ----------
//     // If search_web is true, proceed exactly as before, using the generated queries
//     const FormattedQueries = queries;
//     if (FormattedQueries.length === 0) {
//       return res.status(400).json({
//         message: "No search queries could be generated.",
//       });
//     }

//     // Emit event about the query to the user
//     EmitEvent(user_id, "query_status", {
//       MessageId,
//       status: {
//         message: `Searching for`,
//         data: [`Crawling web for: ${JSON.stringify(FormattedQueries)}`],
//       },
//     });

//     let WebResults;

//     if (plan_status === "active" && web_search_depth === "deep_web") {
//       EmitEvent(user_id, "query_status", {
//         MessageId,
//         status: {
//           message: `Understanding_Intent`,
//           data: [`I am now breaking down ${req.user.username}'s intent`],
//         },
//       });

//       const FinalLinksToScrape = await HandleDeepWebResearch(
//         FormattedQueries,
//         req.user,
//         null,
//         MessageId,
//         plan_type
//       );

//       if (FinalLinksToScrape?.length === 0) {
//         return res.status(400).send({
//           message:
//             "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
//         });
//       }

//       let LinksToFetch = [];
//       FinalLinksToScrape.forEach((li) => {
//         if (li) {
//           const data = FilterUrlForExtraction(li, req.user);
//           LinksToFetch.push(data);
//         }
//       });
//       const FlatLinks = LinksToFetch.flat();

//       if (FlatLinks.length === 0) {
//         return res.status(400).send({
//           message:
//             "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
//         });
//       }

//       const CleanedWebData = await ProcessForLLM(
//         FlatLinks,
//         req.user,
//         question,
//         MessageId,
//         null,
//         plan_type
//       );

//       if (!CleanedWebData || CleanedWebData.length === 0) {
//         return res.status(400).send({
//           message:
//             "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
//         });
//       }

//       WebResults = FormattForLLM(CleanedWebData);
//     } else {
//       // Surface web search – restore the real fetchSearchResults call
//       const { response, links: LinksToFetch } = await fetchSearchResults(
//         plan_type,
//         FormattedQueries.join(","),
//         req.user,
//         MessageId
//       );
//       if (!response || LinksToFetch?.length === 0) {
//         return res.status(404).json({ message: "No search results found." });
//       }

//       // For now, using mock links as in original code
//       // const LinksToFetch = [
//       //   "https://www.un.org/en/climatechange/reports",
//       //   "https://climateanalytics.org/publications/cat-global-update-as-the-climate-crisis-worsens-the-warming-outlook-stagnates",
//       //   "https://scied.ucar.edu/learning-zone/climate-change-impacts/predictions-future-global-climate",
//       //   "https://www.ipcc.ch/sr15/",
//       // ];
//       const CleanedWebData = await ProcessForLLM(
//         LinksToFetch,
//         req.user,
//         question,
//         MessageId,
//         null,
//         plan_type
//       );

//       if (CleanedWebData.length === 0) {
//         console.error("Error in llm processing handler");
//         notifyMe("Error in llm processing handler");
//         return res.status(400).send({
//           message:
//             "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
//         });
//       }

//       WebResults = FormattForLLM(CleanedWebData);
//     }

//     if (
//       !WebResults ||
//       WebResults?.error ||
//       WebResults?.FinalContent?.length === 0
//     ) {
//       console.error("no web results found", WebResults?.error);
//       notifyMe("No web results found", WebResults?.error);
//       return res.status(400).send({
//         message:
//           "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
//       });
//     }

//     // Extract chat history for context
//     let history = [];
//     const pastConversation = await GetChatsForContext(req.user, plan_type);
//     if (!pastConversation || pastConversation.length === 0) {
//       history.push(`Failed to get session chat history`);
//     } else {
//       history = [...pastConversation];
//     }

//     // Cache user message
//     const message = {
//       id: userMessageId,
//       sent_by: "You",
//       message: { isComplete: true, content: question },
//       sent_at: currentTime,
//     };
//     await CacheCurrentChat(message, req.user);

//     // Generate final answer using the existing WebSearchDistributor prompt
//     const Answer = await GenerateResponse(
//       `These are queries by you previously to search the web=${JSON.stringify(
//         FormattedQueries
//       )}&UserQuery=${question}&chathistory_between you and the user=${JSON.stringify(
//         history
//       )}`,
//       WEB_SEARCH_DISTRIBUTOR_PROMPT
//     );

//     if (Answer?.error) {
//       return res.status(400).send({
//         message:
//           "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
//       });
//     }

//     const AiMessage = {
//       id: MessageId,
//       sent_by: "AntiNode",
//       message: {
//         isComplete: true,
//         content: Answer?.result,
//       },
//       sent_at: currentTime,
//     };
//     await CacheCurrentChat(AiMessage, req.user);

//     const StoreChats = await StoreQueryAndResponse(
//       user_id,
//       question,
//       Answer?.result
//     );
//     if (StoreChats.error) {
//       await notifyMe(
//         `Error while storing response history ${StoreChats.error}`
//       );
//     }

//     const FormattedFavicon = {
//       MessageId,
//       icon: WebResults.favicons,
//       url: WebResults.urls,
//     };

//     return res.send({
//       Answer: Answer?.result,
//       message: "Results found",
//       favicon: FormattedFavicon,
//     });
//   } catch (err) {
//     notifyMe(
//       "An error occured in the postTypewebsearch controller function filecontroller.js line 1204",
//       err
//     );
//     console.error(err);
//     return res.status(500).send({
//       message:
//         "Looks like our models are overloaded right now please wait before trying again, thanks for your patience",
//     });
//   }
// };
