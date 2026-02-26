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
