import express from "express";
import cors from "cors";
import 'dotenv/config';
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use(cors());
app.use(express.json()); 

app.use("/", chatRoutes);

app.listen(process.env.PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ process.env.PORT);
    else 
        console.log("Error occurred, server can't start", error);
    }
);