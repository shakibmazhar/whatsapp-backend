// Imports
import express from "express";
import mongoose from "mongoose";
import { connectionString, pusher } from "./dbConnect.js";
import dbModel from "./dbMessages.js";
import cors from "cors";

// App config
const app = express();
const port = process.env.PORT || 9000;

// Middleware
app.use(express.json());
app.use(cors());

// DB Config
mongoose.connect(connectionString, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
    console.log("DB is connected");
    const msgcollection = db.collection("messagecontents");
    const changeStream = msgcollection.watch();
    changeStream.on("change", (change) => {
        console.log(change);
        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                _id: messageDetails._id,
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });
        } else {
            console.log("Error triggering Pusher");
        }
    });
});

// API Routes
app.get("/", (req, res) => {
    res.status(200).send("Server running...");
});

// Get all messages
app.get("/api/v1/messages/sync", (req, res) => {
    dbModel.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});

app.post("/api/v1/messages/new", (req, res) => {
    const dbMessage = req.body;
    dbModel.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });
});

// listen
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
