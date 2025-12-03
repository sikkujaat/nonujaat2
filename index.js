const express = require("express");
const app = express();
const crypto = require("crypto");
app.use(express.json());

// VERIFY TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// WEBHOOK VERIFICATION
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// MESSAGE RECEIVER
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const event = entry.messaging[0];
      console.log("Message Received:", event);

      // Auto reply
      if (event.message && event.sender.id) {
        sendMessage(event.sender.id, "Bot is working ✨");
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// SEND MESSAGE API
const PAGE_TOKEN = process.env.PAGE_TOKEN;
function sendMessage(userId, text) {
  const fetch = require("node-fetch");
  return fetch(`https://graph.facebook.com/v12.0/me/messages?access_token=${PAGE_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: userId },
      message: { text }
    })
  });
}

app.get("/", (req, res) => res.send("Messenger Bot Running"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
