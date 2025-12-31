import { supabase } from "./supabaseHandler.js";
import { notifyMe } from "../ErrorNotificationHandler/telegramHandler.js";
export const RecieveReviews = async (req, res) => {
  try {
    const { review, where, Occupation, Rating } = req.body;
    const userid = req.user.user_id;
    if (!userid) {
      return res.status(400).json({ message: "User Id not found !" });
    }
    if (
      !review ||
      typeof review !== "string" ||
      !where ||
      typeof where !== "string"
    ) {
      return res.status(400).json({ message: "Invalid data" });
    }
    if (
      !Occupation ||
      !Rating ||
      typeof Rating !== "string" ||
      typeof Occupation !== "string"
    ) {
      return res.status(400).json({ message: "Invalid data" });
    }
    // console.log(review,where)
    const { error } = await supabase.from("reviews").insert({
      user_id: userid,
      review_body: review,
      field_of_help: where,
      Occupation: Occupation,
      Rating: Rating,
    });

    if (error) {
      await notifyMe("Error while storing a user feedback", {
        user: req.user,
        review_body: review,
        field_of_help: where,
        Occupation,
        Rating,
      });
      return res
        .status(400)
        .json({ message: "Error while Recording your feedback" });
    }

    return res.json({ message: "Thanks for you valuable time." });
  } catch (error) {
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
