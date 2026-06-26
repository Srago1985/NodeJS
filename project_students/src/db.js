import { MongoClient } from 'mongodb';

let client;
let db;

const ensureStudentIndexes = async (database) => {
    const studentsCollection = database.collection('students');

    await studentsCollection.createIndexes([
        { key: { id: 1 }, name: 'idx_students_id_unique', unique: true },
        {
            key: { name: 1 },
            name: 'idx_students_name_ci',
            collation: { locale: 'en', strength: 2 }
        },
        { key: { 'scores.$**': 1 }, name: 'idx_students_scores_wildcard' }
    ]);
};

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
    await ensureStudentIndexes(db);
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