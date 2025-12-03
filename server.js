import express from "express";
import cors from "cors";
import 'dotenv/config';
import chatRoutes from "./routes/chatRoutes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", chatRoutes);

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(process.env.PORT, (error) => {
        if (!error)
            console.log("Server is Successfully Running, and App is listening on port " + process.env.PORT);
        else
            console.log("Error occurred, server can't start", error);
    }
    );
}