// tavily web search skeleton

// export const PostTypeWebSearch = async (req, res) => {
//   try {
//     const user_id = req.user.user_id;
//     if (!user_id)
//       return res.status(401).send({ message: "Please login to continue" });

//     const IsPremiumUser = req.user.PaymentStatus;
//     if (IsPremiumUser === null || IsPremiumUser === undefined) {
//       return res.status(403).send({
//         message:
//           "Please logout and logIn again to be able to experience new features",
//       });
//     }
//     const { question, MessageId, userMessageId } = req.body;
//     // if (!question) return res.status(404).send({ message: "Invalid question" });

//     // check the current credit limit record for the user
//     const UpdateState = await ProcessUserQuery(req.user, "web_search");

//     // if user has reached the
//     if (UpdateState.status.trim().toLowerCase().includes("not ok")) {
//       return res.status(200).send({
//         Answer: UpdateState.message,
//         message: "Todays quota has finished!",
//         docUsed: [],
//       });
//     }
//     let history = [];
//     const pastConversation = await GetChatsForContext(req.user);
//     if (!pastConversation || pastConversation.length === 0) {
//       history.push(`Failed to get session chat history`);
//     } else {
//       history = [...pastConversation];
//     }

//     const QueriesRequired = await FindIntent(IntentIdentifier, question);

//     if (QueriesRequired && QueriesRequired?.error) {
//       console.error("Intent error");
//       return res
//         .status(400)
//         .send({ message: "Error while processing your request" });
//     }

//     const Results = FilterIntent(QueriesRequired);

//     if (Results.length === 0) {
//       console.error("Results  error");

//       return res
//         .status(400)
//         .send({ message: "Error while processing your request" });
//     }

//     // const WebResults = await SearchQueryResults(question, req.user);
//     // if (WebResults.error) {
//     //   await notifyMe(WebResults.error);
//     //   return res.status(400).send({ message: "The server is busy right now" });
//     // }
//     // const Formattedresult = formatForGemini(WebResults.response);
//     // if (!Formattedresult) {
//     //   await notifyMe(`${Formattedresult}, "Results formatting error"`);
//     //   return res.status(400).send({
//     //     message: "The server is busy right now",
//     //     favicon: { MessageId, icon: [] },
//     //   });
//     // }
//     const WebResults = await SearchQueriesResults(Results, req.user);

//     if (WebResults.error) {
//       return res
//         .status(400)
//         .send({ message: "Error while processing your request" });
//     }

//     const message = {
//       id: userMessageId, //users message Id
//       sent_by: "You", //sent by the user
//       message: { isComplete: true, content: question },
//       sent_at: currentTime,
//     };
//     // update the cache
//     await CacheCurrentChat(message, req.user);
//     const WebResultPrompt = WEB_SEARCH_DISTRIBUTOR_PROMPT;

//     // const FinalContext = `This the session_history=${JSON.stringify(
//     //   history
//     // )} and these are the results from the web-${Formattedresult}`;

//     let Answer = await GenerateResponse(
//       question,
//       WebResults.response,
//       WebResultPrompt,
//       req.user
//     );
//     if (Answer.error) {
//       console.error(Answer.error, "Gemini response generation error");
//       await notifyMe(
//         `Error while generating a response by gemini :${Answer.error}`
//       );
//       // fallback response
//       const results = await FormatForHumanFallback(WebResults.response);
//       Answer = results.text;
//     }

//     const AiMessage = {
//       id: MessageId,
//       sent_by: "AntiNode", //sent by the user
//       message: {
//         isComplete: true,
//         content: Answer,
//       },
//       sent_at: currentTime,
//     };
//     // update the cache
//     await CacheCurrentChat(AiMessage, req.user);

//     // store in the db
//     const StoreChats = await StoreQueryAndResponse(user_id, question, Answer);
//     if (StoreChats.error) {
//       await notifyMe(
//         `Error while storing response history ${StoreChats.error}`
//       );
//     }

//     // find the update the chats
//     const misallaneousChatsKey = `user=${req.user.username}'s_misallaneousChats`;
//     // update the chats cache in redis
//     const OldChats = await redisClient.get(misallaneousChatsKey);
//     if (OldChats) {
//       const newChats = JSON.parse(OldChats);
//       newChats.push({
//         created_at: new Date().toISOString(),
//         question: question,
//         AI_response: Answer.text,
//       });

//       //update the value of the key
//       await redisClient.set(misallaneousChatsKey, JSON.stringify(newChats), {
//         expiration: {
//           type: "Ex",
//           value: 600,
//         },
//       });
//     }

//     const FormattedFavicon = {
//       MessageId,
//       icon: WebResults.favicons, //favicon array from the web search
//     };

//     //  now that we have generated all the response and data for the user
//     // we need to check if the user is within the credit limit or does even has a record in db and cache
//     //if true we update the value in both else we create a new record

//     return res.send({
//       Answer: Answer,
//       message: "Results found",
//       favicon: FormattedFavicon,
//     });
//   } catch (err) {
//     await notifyMe(
//       "An error occured in the postTypewebsearch controller function",
//       err
//     );
//     console.error(err);
//     return res.status(500).send({ message: "Something went wrong" });
//   }
// };
