const express = require('express');
require('dotenv').config(); // <-- ADDED: Loads environment variables
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

const cors = require('cors');

const fs = require("fs");
const path = require("path");

const responses = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "responses.json"), "utf-8")
);

function findResponse(userMessage) {
  const lower = userMessage.toLowerCase();

  for (const rule of responses.rules) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        return rule.response;
      }
    }
  }

  return responses.default_response;
}


//set up correctly
app.use(cors());
app.use(express.json()); 


// const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

app.get('/', (req, res)=>{
    res.status(200);
    res.send("Welcome to root URL of Server");
});

app.get('/helloworld', (req, res)=>{
    res.status(200);
    res.send({ "hello": "Hello World"});
});

app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  // Rule-based response
  const reply = findResponse(prompt);

  res.json({ reply });
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);