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

app.listen(PORT, () => {
    console.log('Server is running on port ' + 'http://localhost:' + PORT);
});