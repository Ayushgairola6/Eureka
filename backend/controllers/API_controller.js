import { randomBytes } from "node:crypto";
import { supabase } from "./supabaseHandler.js";
import bcrypt from "bcryptjs";

export const Generate_API_keys = async (req, res) => {
  try {
    const user_id = req?.user?.user_id;
    if (!user_id) {
      return res
        .status(401)
        .json({
          message: "Unauthorized, please login into your account to continue",
        });
    }
    // check if user already has an api key
    const { data, error } = await supabase
      .from("API_KEYS")
      .select("user_id, API_KEY")
      .eq("user_id", user_id);
    if (error) {
      // console.error(error)
      return res.status(500).json({ message: "Something went wrong!" });
    }

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      data[0]?.user_id === user_id &&
      data[0]?.API_KEY
    ) {
      return res
        .status(200)
        .json({
          message: "You already have an API key assigned",
          key: data[0].API_KEY,
        });
    }
    // if the user does not have an api key generate one for them
    const plaintextKey = randomBytes(32).toString("hex");
    const hashed_api_key = await bcrypt.hash(plaintextKey, 10);

    const { error: insertError } = await supabase
      .from("API_KEYS")
      .insert({ user_id: user_id, API_KEY: hashed_api_key });
    // console.log(hashed_api_key)
    if (insertError) {
      // console.log(insertError);
      return res.status(500).json({ message: "Something went wrong!" });
    }
    // Return the plaintext key to the user, not the hashed one
    return res.status(200).json({ key: plaintextKey });
  } catch (error) {
    // console.error(error);

    return res.status(500).json({ message: "Internal server error" });
  }
};
