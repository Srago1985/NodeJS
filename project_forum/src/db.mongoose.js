import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ForumPostModel from './model/mongoose_post.js';
import AccountUserModel from './model/mongoose_user.js';

dotenv.config();

let isConnected = false;

const ensureIndexes = async () => {
    await ForumPostModel.createIndexes();
    await AccountUserModel.createIndexes();
};

export const connectToMongoose = async () => {
    if (isConnected) {
        return mongoose.connection;
    }

    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'java63';

    if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
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
