const express = require('express');
require('dotenv').config(); // <-- ADDED: Loads environment variables
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;

const cors = require('cors');

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

app.post('/chat', async (req, res) => {
  try {
    // Get the user's prompt from the request body
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
    console.log(response.text);

    res.status(200);
    res.send({ "result": response.text});

    await result.response;
    const text = response.text();

    res.json({ response: text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);