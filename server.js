import express from "express";
import cors from "cors";
import fs from "fs";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

const PORT = 4000;

app.use(cors());
app.use(express.json()); 

const responseData = JSON.parse(fs.readFileSync("./responses.json", "utf-8"));
app.locals.responses = responseData;

app.use("/", chatRoutes);

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);