export const QueryPersonalDocs = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.write(`event: Error while generating a response\n`);
      res.end();
    }

    const { docId, question, query_type } = req.query;

    if (
      !docId ||
      typeof docId !== "string" ||
      !question ||
      typeof question !== "string" ||
      !query_type ||
      typeof query_type !== "string"
    ) {
      res.write(`event: Error while generating a response\n`);
      res.end();
    }
    //  setting the specific headers for stream type

    const FoundData = [];
    let response;

    const SYSTEM_PROMPT =
      query_type === "QNA"
        ? process.env.SYSTEM_PROMPT
        : query_type === "Summary"
        ? process.env.SUMMARIZER_PROMPT
        : process.env.WEB_SEARCH_RESULT_PROMPT;

    if (query_type === "QNA") {
      response = await index.searchRecords({
        query: {
          topK: 30,
          inputs: { text: question },
          filter: {
            documentId: { $eq: docId },
            visibility: { $eq: "Private" },
          },
        },
        fields: ["text"],
      });

      if (response.result.hits.length === 0) {
        res.write(`event: Error while generating a response\n`);
      }
    }
    // if the query is summary type
    else if (query_type === "Summary") {
      const { data, error } = await supabase
        .from("Contributions")
        .select("feedback , chunk_count ,username")
        .eq("document_id", docId);

      if (error || !data.length === 0) {
        res.write(`event: Error while generating a response\n`);
      }

      //   console.log(data)
      response = await getAllDocumentTextsForSummary(
        docId,
        data[0].username,
        data[0].feedback,
        data[0].chunk_count
      );
      if (!response || response.length === 0) {
        res.write(`event: Error while generating a response\n`);
        res.end();
      }
    } else {
      // Handle invalid query_type
      res.write(`event:Error while generating a response\n`);
      res.end();
    }

    if (response?.result?.hits) {
      response.result.hits.forEach((e) => {
        if (e) {
          FoundData.push(e.fields.text);
        } else {
          console.log("no results found");
        }
      });
    }

    // geenrating the response based on the found context
    let AnswerToUsersQuestion = await GenerateResponse(
      question,
      FoundData.length !== 0 ? FoundData : response,
      SYSTEM_PROMPT
    );
    // console.log(AnswerToUsersQuestion, "anser to qustion");
    if (AnswerToUsersQuestion?.error) {
      // console.log(AnswerToUsersQuestion.error);
      const WebResults = await SearchQueryResults(question);

      AnswerToUsersQuestion = FormatForHumanFallback(WebResults, question);

      // res.write(`event: Error while generating a response\n`);
    }

    const storeResponse = await StoreQueryAndResponse(
      user.user_id,
      question,
      AnswerToUsersQuestion,
      docId
    );

    if (storeResponse.error) {
      console.log(storeResponse.error);
    }

    const Chunks = chunkMarkdown(AnswerToUsersQuestion);
    let i = 0;
    const interval = 80;
    // condition to avoid big chunks
    const charSender = setInterval(() => {
      if (i < Chunks.length) {
        // const safeChunk = markdown.charAt(i);
        res.write(formatSSEChunk(Chunks[i]));
        i++;
      } else {
        clearInterval(charSender);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }, interval);

    req.on("close", () => {
      console.log("Client disconnected");
      res.end();
    });
  } catch (error) {
    console.log(error);
    res.write(`event: error\n`);
  }
};

export const FindMatchingResponse = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    if (!user_id || typeof user_id !== "string")
      return res.status(400).json({ message: "Please login to continue" });
    // const { question, category, subCategory } = req.body;
    const { question, category, subCategory } = req.query;
    if (
      !question ||
      typeof question !== "string" ||
      !category ||
      typeof category !== "string" ||
      !subCategory ||
      typeof subCategory !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "Some fields are missing or the query is Invalid !" });
    }

    //  setting the specific headers for stream type

    // finding info regarding that query
    const FoundData = [];
    const DocumentsUserForReference = [];
    //    console.log(fetchResult)
    const response = await index.searchRecords({
      query: {
        topK: 10,
        inputs: { text: question },
        filter: {
          category: { $eq: category },
          subCategory: { $eq: subCategory },
          visibility: { $eq: "Public" },
        },
      },
      fields: [
        "text",
        "category",
        "subCategory",
        "date_of_contribution",
        "documentId",
        "contributor",
      ],
    });
    // if the question is too vague
    if (response.result.hits.length === 0) {
      return res.status(200).json({
        message: "Response found",
        answer: `Could you please be more specific about what you would like to know about ${subCategory}`,
        doc_id: [],
      });
    }
    // a set to store only unique values of document ids
    const seen = new Set();

    try {
      for (const e of response.result.hits) {
        if (!e) {
          console.log("Empty resuls found");
          continue;
        }
        const uniqueKey = `${e.fields.documentId}-${e.fields.contributor}`;
        if (seen.has(uniqueKey)) continue;
        try {
          //1.  push the text results
          FoundData.push(e.fields.text);
          //2. get the data of that respective document
          const { data, error } = await supabase
            .from("Doc_Feedback")
            .select("upvotes, downvotes, partial_upvotes")
            .eq("document_id", e.fields.documentId)
            .single();

          // console.log("Document feedback")
          if (error) throw error;
          if (!data) {
            console.warn(
              `No feedback data found for document ${e.fields.documentId}`
            );
            continue;
          }
          //3. construct the data of the doc object
          DocumentsUserForReference.push({
            doc_id: e.fields.documentId,
            uploaded_by: e.fields.contributor,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            partial_upvotes: data.partial_upvotes,
          });

          seen.add(uniqueKey);
        } catch (formattingdataerror) {
          console.log(formattingdataerror);
        }
      }
    } catch (er) {
      console.error(er);
    }

    res.write(`event: metadata\n`);
    res.write(
      `data: ${JSON.stringify({ documents: DocumentsUserForReference })}\n\n`
    );
    const AnswerToUsersQuestion = await GenerateResponse(question, FoundData);

    const storeResponses = await StoreQueryAndResponse(
      user_id,
      question,
      AnswerToUsersQuestion
    );

    if (storeResponses.error) {
      // return res.status(200).json({
      //   message: "Could not store this request",
      //   answer: AnswerToUsersQuestion,
      // });
    }
    // creating lines
    const Chunks = chunkMarkdown(AnswerToUsersQuestion);
    let i = 0;
    const interval = 80;
    // condition to avoid big chunks
    const charSender = setInterval(() => {
      if (i < Chunks.length) {
        // const safeChunk = markdown.charAt(i);
        res.write(formatSSEChunk(Chunks[i]));
        i++;
      } else {
        clearInterval(charSender);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }, interval);

    // Handle client disconnect
    req.on("close", () => {
      console.log("Client disconnected");
      res.end();
    });

    const responseId = uuidv4();

    // return res.status(200).json({
    //   message: "Response found",
    //   answer: AnswerToUsersQuestion,
    //   Airesponse: {
    //     id: responseId,
    //     sent_by: "AntiNode",
    //     sent_at: currentTime,
    //     message: AnswerToUsersQuestion,
    //   },
    //   // doc_id: DocumentsUserForReference,
    // });
  } catch (error) {
    console.log(error);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    // res.end();
  }
};
