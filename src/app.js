import express from "express";
import "dotenv/config";
import fileRoutes from "./routes/fileRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cors from 'cors';


const app = express();



const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use((err, req, res, next) => {
    console.error(err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'File size exceeds 10 MB'
        });
    }

    return res.status(500).json({
        error: 'Internal Server Error'
    });
});
app.listen(PORT, () => {
    console.log('Server is running on port ' + 'http://localhost:' + PORT);
});