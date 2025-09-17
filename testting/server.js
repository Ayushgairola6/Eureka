// server.js
import http from "http";

http
  .createServer((req, res) => {
    if (req.url === "/sse") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "access-control-allow-origin": "*",
      });

      const words = [
        "Hello",
        "world",
        "i",
        "am",
        "testing",
        "out this event source",
        "functionality",
      ];
      let i = 0;

      const sendWord = () => {
        if (i < words.length) {
          res.write(`data: ${words[i]}\n\n`);
          console.log("Sent:", words[i]);
          i++;
          setTimeout(sendWord, 500);
        } else {
          res.write("data: [DONE]\n\n");
          res.end();
        }
      };

      sendWord();

      req.on("close", () => {
        console.log("Client disconnected");
        res.end();
      });
    }
  })
  .listen(5000, () => console.log("SSE server running on :5000"));
