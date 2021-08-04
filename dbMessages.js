import mongoose from "mongoose";

const dbSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
});

const dbModel = mongoose.model("messagecontent", dbSchema);

export default dbModel;
