import express from 'express';
import dotenv from 'dotenv';
import router from './routes/students_routes.js';

dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());

app.use(router);

app.use((req, res) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});