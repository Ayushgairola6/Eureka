import express from "express";
import cors from "cors";
import { createServer } from "http";
const app = express();
const httpServer = createServer(app);
import { initializeSocketIo } from "./websocketsHandler.js/socketIoInitiater.js";
initializeSocketIo(httpServer);
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import "./service_worker.js"; //the cron job scheduler
import { Router } from "./routers/filerouter.js";
import { AuthRouter } from "./routers/AuthRouter.js";
import { ChatsRouter } from "./routers/ChatsRouter.js";
import { ReviewRouter } from "./routers/ReviewRouter.js";
import { API_Router } from "./routers/ApiRouter.js";
import { SdkRouter } from "./routers/sdkRouter.js";
import "./controllers/supabaseHandler.js";
// import "./Tests/tests.js";
// import formData from 'express-form-data';
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://antinode-six-eta.vercel.app",
      "https://eureka-six-eta.vercel.app",
      "https://antinodeai.space",
      "https://www.antinodeai.space",
    ],
    credentials: true,
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Requested-With",
      "Accept",
    ],

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Set this if your app is behind a reverse proxy (e.g., Heroku, Nginx)
app.set("trust proxy", 1);
// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded());
app.use("/api/", Router);
app.use("/api/", AuthRouter);
app.use("/api/", ReviewRouter);
app.use("/api/", API_Router);
app.use("/api/", SdkRouter);
app.use("/api/", ChatsRouter);

httpServer.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server has started on port ${process.env.PORT}`);
});

export default httpServer;
