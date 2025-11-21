import express from "express";
import cors from "cors";
import fs from "fs";
import chatRoutes from "./routes/chatRoutes.js";
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json()); 

const responseData = JSON.parse(fs.readFileSync("./cleopatra.json", "utf-8"));
app.locals.responses = responseData;

app.use("/", chatRoutes);

app.listen(process.env.PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ process.env.PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);