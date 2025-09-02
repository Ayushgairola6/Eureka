import express from 'express';
import { HandleUserLogin, HandleUserRegistration ,GetUserAccountDetails,Accept_Or_rejectRequest,DeleteNotification} from '../controllers/AuthController.js';
export const AuthRouter = express.Router();
import {UpdateUserLoginState, VerifyToken} from '../Middlewares/AuthMiddleware.js'

AuthRouter.post("/user/register", HandleUserRegistration)
    .post("/user/login", HandleUserLogin)
    .get("/verify/userstate",VerifyToken,UpdateUserLoginState)
    .get('/user/account-details',VerifyToken,GetUserAccountDetails)
    .post("/user/requests/:action_type/:requested_user_id/:room_id/:room_name/:admin_id",VerifyToken,Accept_Or_rejectRequest)
    .put("/user/delete/notification/:notification_id",VerifyToken,DeleteNotification)