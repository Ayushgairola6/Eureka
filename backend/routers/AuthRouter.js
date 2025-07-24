import express from 'express';
import { HandleUserLogin, HandleUserRegistration ,GetUserAccountDetails} from '../controllers/AuthController.js';
export const AuthRouter = express.Router();
import {UpdateUserLoginState, VerifyToken} from '../Middlewares/AuthMiddleware.js'

AuthRouter.post("/user/register", HandleUserRegistration)
    .post("/user/login", HandleUserLogin)
    .get("/verify/userstate",VerifyToken,UpdateUserLoginState)
    .get('/user/account-details',VerifyToken,GetUserAccountDetails)