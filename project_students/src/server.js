import express from 'express';
import dotenv from 'dotenv';
import router from './routes/students_routes.js';
import { connectToMongo } from './db.js';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use(router);

app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not Found');
});

try {
    await connectToMongo();
    console.log('MongoDB connected');

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error('MongoDB connection failed', error);
    process.exit(1);
}