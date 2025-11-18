import { postResponseMessage } from "../services/chatService";

export function postChatMessage(req, res) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  // Rule-based response
  const reply = postResponseMessage(message);

  res.json({ reply });

}
