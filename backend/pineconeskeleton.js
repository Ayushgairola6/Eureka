// export const FileUploadHandle = async (req, res) => {
//   try {
//     const { category, feedback, subCategory, visibility, about } = req.body;
//     const file = req.file;
//     const userid = req.user.user_id;
//     if (!userid) {
//       return res.status(400).json({ message: "Please Login to continue ." });
//     }
//     const email = req.user.email;
//     if (
//       !category ||
//       typeof category !== "string" ||
//       typeof feedback !== "string" ||
//       !feedback ||
//       !email ||
//       !file ||
//       !subCategory ||
//       typeof subCategory !== "string" ||
//       !visibility ||
//       !about ||
//       typeof about !== "string"
//     ) {
//       return res.status(400).json({ message: "Invalid data type !" });
//     }
//     const documentId = uuidv4();

//     const ParsedText = await CheckFileTypeAndParseIt(file);
//     // console.log(ParsedText);

//     if (!ParsedText) {
//       return res.status(400).send({
//         message: "An error occured while extracting text from your file",
//       });
//     }
//     const textChunks = await splitTextIntoChunks(ParsedText);

//     // get the file extension type and append to the title
//     const FileType = file.originalname.split(".").pop().toLowerCase();
//     if (!textChunks || textChunks.length === 0) {
//       await notifyMe(`Error while chunking the text by ${req.user.username}`);
//       return res.status(400).json({
//         message: "Error while processing your file",
//         insertData: {
//           id: "Not found",
//           chunk_count: 0,
//           feedback: feedback,
//           created_at: new Date().toISOString(),
//           document_id: documentId,
//         },
//       });
//     }
//     // random id for the doc
//     let chunkNumber;
//     // array to store a unique record array for upsert operation
//     const recordsToUpsert = [];
//     // the size of one batch that we process
//     const batchSize = req.user.PaymentStatus === true ? 90 : 50;
//     // loop to start pushing chunks into the db
//     for (let i = 0; i < textChunks.length; i++) {
//       // Generate a unique ID for each chunk
//       // Option 1: documentId-chunkIndex (simple)
//       chunkNumber = i;
//       const chunkId = `${documentId.trim()}:${req.user.username.trim()}:${feedback.trim()}:${chunkNumber}`;

//       // pushing the chunk data in formatted way to store in the db
//       recordsToUpsert.push({
//         id: chunkId,
//         text: textChunks[i],
//         visibility: visibility,
//         category: category,
//         subCategory: subCategory,
//         date_of_contribution: new Date().toISOString(),
//         documentId: documentId,
//         contributor: userid,
//       });

//       // If batch is full or it's the last chunk, upsert the batch
//       if (recordsToUpsert.length === batchSize || i === textChunks.length - 1) {
//         try {
//           await index.upsertRecords(recordsToUpsert); //upsert the records
//           // console.log(`Upserted batch of ${recordsToUpsert.length} records.`);
//           recordsToUpsert.length = 0; // reset the records array
//         } catch (error) {
//           await notifyMe(
//             `Error ${error} while batch upsert the file by ${req.user.username}`
//           );

//           // Implement more specific error handling if needed
//           return res.status(500).json({
//             message: "Error during Pinecone upsert operation.",
//             insertData: {
//               id: "Not found",
//               chunk_count: 0,
//               feedback: feedback,
//               created_at: new Date().toISOString(),
//               document_id: documentId,
//             },
//           });
//         }
//       }
//     }

//     // If there are any remaining records after the loop
//     // in case of records less than batchsize
//     if (recordsToUpsert.length > 0) {
//       try {
//         await index.upsertRecords(recordsToUpsert);
//         // console.log(`Upserted final batch of ${recordsToUpsert.length} records.`);
//       } catch (error) {
//         await notifyMe(`${error} = error while batch upserting`);
//         return res.status(500).json({
//           message: "Error during Pinecone upsert operation.",
//           insertData: {
//             id: "Not found",
//             chunk_count: 0,
//             feedback: feedback,
//             created_at: new Date().toISOString(),
//             document_id: documentId,
//           },
//         });
//       }
//     }
//     const documentmetadata = {
//       category: category,
//       subCategory: subCategory,
//       about: about,
//     };
//     // storing the contribution details
//     const StoredContribution = await StoreContributionDetails(
//       email,
//       `${feedback}.${FileType}`, //append the file extension for ux purposes
//       userid,
//       visibility,
//       documentId,
//       chunkNumber,
//       documentmetadata
//     );
//     const UserAccountDataKey = `user_id=${userid}'s_dashboardData`;

//     if (StoredContribution?.error) {
//       await notifyMe(StoredContribution.error);
//       return res.status(400).json({
//         message: StoredContribution.error,
//         insertData: {
//           id: "Not found",
//           chunk_count: 0,
//           feedback: feedback,
//           created_at: new Date().toISOString(),
//           document_id: documentId,
//         },
//       });
//     }
//     if (StoredContribution.InsertedData) {
//       // handle user cache information if the documents are not private
//       if (visibility === "Private") {
//         await UpdateUserFileListCacheInfo(
//           UserAccountDataKey,
//           StoredContribution.InsertedData
//         );
//       }
//     }

//     // create a new notification and inster it in the db
//     const metadata = {
//       sent_by_username: "System",
//     };
//     // add a new notification
//     const { data: newNotification, error: insertError } = await supabase
//       .from("notifications")
//       .insert({
//         user_id: userid, //person who is responsible for this notification
//         notification_type: "Informatory",
//         notification_message: `A new file ${feedback} uploaded .`,
//         title: "New file uploaded",
//         metadata: metadata,
//       })
//       .select("*")
//       .single();

//     if (insertError) {
//       await notifyMe(
//         `${insertError}= This error occured while Inserting notification data in file upload controller `
//       );
//     }

//     const exists = await redisClient.exists(UserAccountDataKey); //if the user data exists in the cache

//     // if the user cache exists
//     if (exists) {
//       const oldNotification = await redisClient.hGet(
//         UserAccountDataKey,
//         "notification"
//       );
//       const UpdatedArray = JSON.parse(oldNotification); //parse and add new notificaiton object
//       UpdatedArray.push(newNotification);
//       await redisClient.hSet(
//         UserAccountDataKey,
//         "notification",
//         JSON.stringify(UpdatedArray)
//       ); //update the cache data
//       await redisClient.hSet(
//         UserAccountDataKey,
//         "notificationcount",
//         JSON.stringify(UpdatedArray.length)
//       );
//     }

//     const io = getIo();
//     if (io) {
//       io.to(userid).emit("new_Notification", newNotification);
//     }

//     return res.json({
//       message: "Upload successfull",
//       insertData: StoredContribution.InsertedData || {},
//     });
//   } catch (error) {
//     console.log(error);
//     await notifyMe(error);
//     return res.status(500).json({ message: "Internal Server error" });
//   }
// };
