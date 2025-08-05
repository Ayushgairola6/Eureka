import { supabase } from "../controllers/supabaseHandler.js";

export const ValidateApiKey = async (req, res, next) => {
    try {
        // check for headers if present
        const Authheaders = req.headers.authorization;
        // extract the api key from headers `Bearer ${API_KEY}`
        const user_api_key = Authheaders?.split(" ")[1];

        if (!Authheaders || !user_api_key) {
            console.log("NO api key in headers")
            return res.status(400).json({ message: "Invalid API key" });
        }

        // check if the api key is present in the database and matches any user in the database

        const { data, error } = await supabase.from("API_KEYS").select("user_id").eq("API_KEY", user_api_key);

        // if some error occurs while looking or validating the apikey an error is returned
        if (error || !data || data.length === 0) {
            console.log(error, 'error while looking for user_id matching the api_key')
            return res.status(404).json({ message: "Invalid API_KEY" });
        }

        // continue to the main function
        req.user = data[0].user_id;
        next();
    } catch (validateApiKeyError) {
        console.error(validateApiKeyError);
        return res.status(500).json({ message: "Internal server error" })
    }
}