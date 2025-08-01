import { supabase } from './supabaseHandler.js';

export const RecieveReviews = async (req, res) => {
    try {
        const { review, where } = req.body;
        const userid = req.user.user_id;
        if (!userid) {
            return res.status(400).json({ message: "User Id not found !" });
        }
        if (!review || typeof review !== "string" || !where || typeof where !== "string") {
            return res.status(400).json({ message: "Invalid data" })
        }
        // console.log(review,where)
        const { error } = await supabase.from("reviews").insert({ user_id: userid, review_body: review, field_of_help: where });

        if (error) {
            console.log(error)
            return res.status(400).json({ message: "Error while Recording your feedback" })
        }

        return res.json({ message: "Done" })
    } catch (error) {
        console.error(error);
    }
}

export const HandleDocumentAuthenticityFeedback = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        if (!user_id) {
            return res.status(400).json({ message: "Unauhthorized" });
        }

        const { likeness, suggestions, docId } = req.body;
        if (!likeness || typeof likeness !== "string" || !suggestions || typeof suggestions !== 'string' || !docId) {
            return res.status(401).json({ message: "Some fields are missing" });
        }
        const cleanedDocIds = deduplicateDocuments(docId)

        // using supbase postgres function to increment the feedback
        try {
            const feedbackUpdates = cleanedDocIds.map(async (doc_id) => {
                const
                    { data, error } =
                        await
                            supabase.rpc(
                                'increment_doc_feedback_vote'
                                , {
                                    p_document_id
                                        : doc_id,
                                    p_user_id
                                        : user_id,
                                    p_vote_type: likeness
                                });
                if (error) {
                    console.error(`Error updating doc ${doc_id}:`, error);
                    throw error;
                }

                return data;
            });

            const updated = await Promise.all(feedbackUpdates);
        } catch (error) {
            console.error('Error in feedback updates:', error);
        }



        return res.json({ message: "Feedback recorded successfully" });
    } catch (error) {
        console.log(error);
    }
}
// only keep on copy of each document Id
function deduplicateDocuments(docIds) {
    const uniqueDocs = new Set();
    const cleanedDocIds = [];

    docIds.forEach(doc => {
        if (doc?.doc_id && !uniqueDocs.has(doc.doc_id)) {
            uniqueDocs.add(doc.doc_id);
            cleanedDocIds.push(doc.doc_id);
        }
    });

    return cleanedDocIds;
}

