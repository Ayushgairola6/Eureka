import express from 'express';
import dotenv from 'dotenv';
import { Router } from './routers/filerouter.js';
import {AuthRouter} from './routers/AuthRouter.js';
import { ReviewRouter } from './routers/ReviewRouter.js';
import {API_Router} from './routers/ApiRouter.js'
import { SdkRouter } from './routers/sdkRouter.js';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();
import cors from 'cors';
import './controllers/supabaseHandler.js'

// import formData from 'express-form-data';
app.use(cors({
  origin: ['http://localhost:5173','https://eureka-six-eta.vercel.app'],
  credentials: true, 
  allowedHeaders: [
    'Authorization',
    'Content-Type', 
    'X-Requested-With',
    'Accept'
  ],
  exposedHeaders: [
    'Authorization', 
    'Set-Cookie'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] 
}));


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded());
app.use("/api/",Router)
app.use("/api/",AuthRouter)
app.use("/api/",ReviewRouter)
app.use("/api/",API_Router)
app.use("/api/",SdkRouter)



app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server has started on port ${process.env.PORT}`);
});