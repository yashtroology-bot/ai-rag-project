const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_API = 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Proxy /upload to Python
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const fileData = fs.readFileSync(file.path);
        const blob = new Blob([fileData], { type: file.mimetype });
        
        const formData = new FormData();
        formData.append('file', blob, file.originalname);

        const response = await fetch(`${PYTHON_API}/upload`, {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json();
        fs.unlinkSync(file.path); // Clean up temp file
        
        if (!response.ok) throw new Error(data.error || 'Upload failed');
        res.json(data);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: 'Failed to upload to AI service' });
    }
});

// Proxy /ask to Python
app.post('/api/ask', async (req, res) => {
    try {
        const response = await fetch(`${PYTHON_API}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: req.body.question })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Query error:", error);
        res.status(500).json({ error: 'Failed to query AI service' });
    }
});

app.listen(PORT, () => {
    console.log(`Node MERN Backend running on http://localhost:${PORT}`);
});
