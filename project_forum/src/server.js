import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { connectToMongoose } from './db.mongoose.js';
import router from './routes/forum_routes.js';

dotenv.config();

const PORT = process.env.PORT || 8080;

const buildError = (status, error, message, pathValue) => ({
	timestamp: new Date().toISOString(),
	status,
	error,
	message,
	path: pathValue,
});

export const createApp = () => {
	const app = express();

	app.use(express.json());
	app.use(router);

	app.use((errorObj, req, res, next) => {
		console.error(errorObj);
		res
			.status(500)
			.json(buildError(500, 'Internal Server Error', 'Unexpected server error', req.originalUrl));
	});

	app.use((req, res) => {
		res
			.status(404)
			.json(buildError(404, 'Not Found', `Route ${req.method} ${req.originalUrl} not found`, req.originalUrl));
	});

	return app;
};

export const startServer = async (port = PORT) => {
	await connectToMongoose();
	const app = createApp();
	return app.listen(port, () => {
		console.log(`Forum server is running on port ${port}`);
        console.log(`Mongoose connected to database ${process.env.MONGODB_DB_NAME}`);
	});
};

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
	startServer().catch((error) => {
		console.error('Mongoose connection failed', error);
		process.exit(1);
	});
}
