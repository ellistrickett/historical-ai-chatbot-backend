import { postResponseMessage } from "../services/chatService.js";

export function postChatMessage(req, res) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const responseData = req.app.locals.responses;

  const reply = postResponseMessage(message, responseData);

  res.json({ reply });

}
