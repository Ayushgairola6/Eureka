import express from "express";
import {
  HandleUserLogin,
  HandleUserRegistration,
  GetUserAccountDetails,
  Accept_Or_rejectRequest,
  DeleteNotification,
  ResetPasswordRequest,
  ResetPassword,
  VerifyEmail,
  HandleUserLogout,
  GetVerificationEmail,
  updateCookies,
} from "../controllers/AuthController.js";
export const AuthRouter = express.Router();
import {
  HandlePreferenceToggle,
  UpdateUserLoginState,
  VerifyToken,
} from "../Middlewares/AuthMiddleware.js";
import {
  HandleGoogleCallback,
  InitiateGoogleAuth,
} from "../controllers/GoogleAuthController.js";

AuthRouter.post("/user/register", HandleUserRegistration)
  .post("/user/get-verification-email", GetVerificationEmail)
  .put("/user/verify-email/:verificationtoken", VerifyEmail)
  .post("/user/refreshSession/", updateCookies)
  .put("/user/update-preference", VerifyToken, HandlePreferenceToggle)
  .post("/user/login", HandleUserLogin)
  .post("/user/session-logout", VerifyToken, HandleUserLogout)
  .get("/verify/userstate", VerifyToken, UpdateUserLoginState)
  .get("/user/account-details", VerifyToken, GetUserAccountDetails)
  .post(
    "/user/requests/:action_type/:requested_user_id/:room_id/:room_name/:admin_id",
    VerifyToken,
    Accept_Or_rejectRequest
  )
  .put(
    "/user/delete/notification/:notification_id",
    VerifyToken,
    DeleteNotification
  )
  .post("/user/reset-password", ResetPasswordRequest)
  .put("/user/reset-password/confirm", ResetPassword)
  .get("/auth/google", InitiateGoogleAuth)
  .get("/auth/google/callback", HandleGoogleCallback);
