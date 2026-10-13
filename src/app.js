import express from "express";
import "dotenv/config";
import fileRoutes from "./routes/fileRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/files", fileRoutes);

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