import { MongoClient } from 'mongodb';

let client;
let db;

export const connectToMongo = async () => {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'college';

    if (db) {
        return db;
    }

    if (!uri) {
        throw new Error('MONGODB_URI is not set');
    }

    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    return db;
};

export const getDb = () => {
    if (!db) {
        throw new Error('MongoDB is not connected');
    }

    return db;
};

export const closeMongoConnection = async () => {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
};