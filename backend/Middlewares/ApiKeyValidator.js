import { supabase } from "../controllers/supabaseHandler";

export const ValidateApiKey = async (req, res, next) => {
    try {
        // check for headers if present
        const Authheaders = req.headers.authorization;
        // extract the api key from headers `Bearer ${API_KEY}`
        const user_api_key = Authheaders?.split(" ")[1];

        if (!Authheaders || !user_api_key) {
            return res.status(400).json({ message: "Invalid API key" });
        }

        // check if the api key is present in the database and matches any user in the database
        const { data, error } = await supabase.from("API_KEYS").select("user_id,API_KEY ,users(id)").single();

        // if some error occurs while looking or validating the apikey an error is returned
        if (error || data.length === 0 || data[0].API_KEY !== user_api_key) {
            return res.status(404).json({ message: "Invalid API_KEY" });
        }

        // continue to the main function
        next();
    } catch (validateApiKeyError) {
        console.error(validateApiKeyError);
        return res.status(500).json({ message: "Internal server error" })
    }
}