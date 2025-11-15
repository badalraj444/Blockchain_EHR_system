import express from 'express';
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import {connectDB} from './lib/db.js';

import authRoutes from './routes/auth.routes.js';

const app = express();

const PORT = process.env.PORT || 5002;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.listen(PORT, ()=>{
    console.log('Server listening on port ' + PORT);
    console.log(process.env.JWT_SECRET_KEY);
    connectDB();
})