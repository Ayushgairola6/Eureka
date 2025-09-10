import dotenv from "dotenv";
dotenv.config();

import Brevo from "@getbrevo/brevo";

export const EmailTransporter = () => {
  const defaultClient = Brevo.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_EUREKA_KEY;

  return new Brevo.TransactionalEmailsApi();
};
