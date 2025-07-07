import { supabase } from './supabaseHandler.js';

export const RecieveReviews = async (req, res) => {
    try {
        const { review,where } = req.body;
        const userid = req.user.id;
        if (!userid) {
            return res.status(400).json({ message: "User Id not found !" });
        }
        if (!review ||typeof review!=="string" ||!where ||typeof where !=="string") {
            return res.status(400).json({ message: "Invalid data" })
        }
        // console.log(review,where)
        const { error } = await supabase.from("reviews").insert({ user_id: userid, review_body: review ,field_of_help:where});

        if (error) {
            console.log(error)
            return res.status(400).json({ message: "Error while Recording your feedback" })
        }

        return res.json({ message: "Done" })
    } catch (error) {
        console.error(error);
    }
}