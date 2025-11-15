import express from 'express';
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import {connectDB} from './lib/db.js';

import authRoutes from './routes/auth.routes.js';
import path from "path";

const app = express();

const PORT = process.env.PORT || 5002;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));



const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"../client","dist")));
    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../client","dist","index.html"));
    });
}

app.listen(PORT, ()=>{
    console.log('Server listening on port ' + PORT);
    connectDB();
})