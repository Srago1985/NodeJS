import mongoose from "mongoose";
import StudentModel from "./model/mongoose_student.js";

const ensureIndexes = async () => {
    await StudentModel.createIndexes();
};

let isConnected = false;

export const connectToMongoose = async () => {
    if (isConnected) {
        return mongoose.connection;
    }
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || "college";
    if (!uri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }
    await mongoose.connect(uri, { dbName });
    isConnected = true;
    await ensureIndexes();
    return mongoose.connection;
};

export const closeMongooseConnection = async () => {
    if (!isConnected) {
        return;
    }
    await mongoose.connection.close();
    isConnected = false;
};