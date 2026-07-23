import express from 'express';
import cors from 'cors';
import bookRouter from './routes/book_routes.js';
import { ApiError } from './model/api_error.js';

const PORT = Number(process.env.PORT || 8080);

const app = express();

app.use(cors());
app.use(express.json());
app.use(bookRouter);

app.use((error, req, res, next) => {
    if (error instanceof ApiError) {
        return res.status(error.status).json({
            timestamp: new Date().toISOString(),
            status: error.status,
            code: error.code,
            message: error.message,
            path: req.originalUrl,
        });
    }

    console.error(error);
    return res.status(500).json({
        timestamp: new Date().toISOString(),
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected server error',
        path: req.originalUrl,
    });
});

app.use((req, res) => {
    res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        path: req.originalUrl,
    });
});

app.listen(PORT, () => {
    console.log(`Book API server is running on port ${PORT}`);
});