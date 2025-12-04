import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

const PAGE_TOKEN = process.env.PAGE_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Webhook verify
app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  res.send("Invalid verify token");
});

// Receive messages
app.post("/webhook", async (req, res) => {
  const data = req.body;

  if (data.object === "page") {
    data.entry.forEach(entry => {
      const messaging = entry.messaging;

      messaging.forEach(async event => {
        if (event.message && event.message.text) {
          const sender = event.sender.id;
          const msg = event.message.text.toLowerCase();

          if (msg.startsWith("change group name")) {
            const name = msg.replace("change group name", "").trim();
            await sendMessage(
              sender,
              `📝 Admin please change the group name to: **${name}**`
            );
          }

          else if (msg.startsWith("change nickname")) {
            const name = msg.replace("change nickname", "").trim();
            await sendMessage(
              sender,
              `👤 Admin please update the nickname to: **${name}**`
            );
          }

          else {
            await sendMessage(
              sender,
              "Commands:\n1) change group name <name>\n2) change nickname <name>"
            );
          }
        }
      });
    });
  }

  res.sendStatus(200);
});

// Send message
async function sendMessage(id, text) {
  await axios.post(
    `https://graph.facebook.com/v17.0/me/messages?access_token=${PAGE_TOKEN}`,
    {
      recipient: { id },
      message: { text }
    }
  );
}

app.listen(3000, () => console.log("Bot server running"));
