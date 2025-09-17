import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuid } from "uuid";

dotenv.config();

export const GenerateSSEspecificTokens = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send({ message: "Please login to continue" });
    }

    const UniqueUUid = uuid();
    // creating a user specific sessionId
    const sessionUniqueId = `sse_${user.user_id}_${Date.now()}_${UniqueUUid}`;

    // unique token just for one time sse event
    const token = jwt.sign(
      {
        user_id: user.user_id,
        sessionId: sessionUniqueId,
        email: user.email,
        username: user.username,
        purpose: "SSE",
        role: "user",
      },
      process.env.SSE_SECRET,
      { expiresIn: "5min" }
    );

    if (!token) {
      return res.status(400).send({ message: "Something went wrong" });
    }
    return res.send({ message: "One time use sse token", token });
  } catch (error) {
    console.error(error, "error while generating sse tokens");
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const VerifySSETokens = (req, res, next) => {
  try {
    const TempToken = req.query.AccessToken;

    if (!TempToken) {
      res.write(`event:Please login to continue\n`);
      res.end();
    }
    // setting the necessary headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    // verifying the user token
    try {
      const decoded = jwt.verify(TempToken, process.env.SSE_SECRET);
      req.user = decoded;

      next();
    } catch (sseerrro) {
      res.write(`event:Error while verifying your details\n`);
      res.end();
    }
  } catch (error) {
    res.write(`event:Something went wrong\n`);
    res.end();
  }
};
