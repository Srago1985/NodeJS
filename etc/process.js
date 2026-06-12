import dotenv from 'dotenv';

dotenv.config({ path: './etc/.env' });
console.log('Environment variables:', process.env.PORT);