import { supabase } from "./supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";

export const RecieveReviews = async (req, res) => {
  try {
    const { review, where, Occupation, Rating } = req.body;
    const userid = req.user.user_id;
    if (!userid) {
      return res.status(400).json({ message: "Please login to continue." });
    }
    if (
      !review ||
      typeof review !== "string" ||
      !where ||
      typeof where !== "string" ||
      !Occupation ||
      !Rating ||
      typeof Occupation !== "string" ||
      typeof Rating !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "Some fields are missing or are invalid" });
    }

    const { error } = await supabase.from("reviews").insert({
      user_id: userid,
      review_body: review,
      field_of_help: where,
      Occupation: Occupation,
      Rating: Rating,
    });

    if (error) {
      console.error(error);

      await notifyMe("Error while storing a user feedback", error);
      return res
        .status(400)
        .json({ message: "Error while Recording your feedback" });
    }

    return res.json({ message: "We have recieved your feedback." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// export const HandleDocumentAuthenticityFeedback = async (req, res) => {
//   try {
//     const user_id = req.user.user_id;
//     if (!user_id) {
//       return res.status(401).json({ message: "Unauhthorized" });
//     }

//     const data = req.body;
//     if (!likeness || typeof likeness !== "string" || !docId) {
//       return res.status(400).json({ message: "Some fields are missing" });
//     }
//     const cleanedDocIds = deduplicateDocuments(docId);

//     return res.json({ message: "Feedback recorded successfully" });
//   } catch (error) {
//     return res.status(500).send({ message: "Something went wrong !" });
//   }
// };

// only keep on copy of each document Id
export function deduplicateDocuments(docIds) {
  const uniqueDocs = new Set();

  docIds.forEach((doc) => {
    if (doc?.doc_id && !uniqueDocs.has(doc.doc_id)) {
      uniqueDocs.add(doc.doc_id);
    }
  });

  const cleanedDocIds = Array.from(uniqueDocs); //convert set to array
  return cleanedDocIds;
}

// handles newsletter acceptance
export const HandleNewsLetterAcceptance = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(402).send({ message: "Please login to continue." });

    const wantsNewUpdates = req.body;

    if (wantsNewUpdates === false)
      return res
        .status(200)
        .send({ message: "Response recorded successfully." });

    const { error } = await supabase
      .from("users")
      .update("Wants_newsLetter", true)
      .eq("id", user.user_id);

    if (error) {
      console.error(error);
      return res.status(400).send({
        message: "You are already subscribed to our newsletter.",
      });
    }
    return res.status(200).send({
      message:
        "You will now recieve newsletters and updates earlier than others.",
    });
  } catch (error) {
    return res.status(500).send({ message: "Something went wrong!" });
  }
};
