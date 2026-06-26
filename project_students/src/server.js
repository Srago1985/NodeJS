import express from 'express';
import dotenv from 'dotenv';
import router from './routes/students_routes.js';
import { connectToMongoose } from './db.mongoose.js';


dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use(router);

app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not Found');
});

try {
    await connectToMongoose();
    
    console.log('Mongoose connected');

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Mongoose connection failed', error);
    process.exit(1);
}