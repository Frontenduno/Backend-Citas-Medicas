import dotenv from 'dotenv';
import path from 'path';

// Force load .env.test for test executions
const envTestPath = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envTestPath, override: true });
