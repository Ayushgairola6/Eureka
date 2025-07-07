import express from 'express';
import dotenv from 'dotenv';
import { Router } from './routers/filerouter.js';
import {AuthRouter} from './routers/AuthRouter.js';
import { ReviewRouter } from './routers/ReviewRouter.js';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();
import cors from 'cors';
import './controllers/supabaseHandler.js'
import multer from 'multer';
// import formData from 'express-form-data';
app.use(cors({
  origin: ['http://localhost:5173'],
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

app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server has started on port ${process.env.PORT}`);
});