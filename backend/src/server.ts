import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { Chat } from './models/Chat';
import { ChatSession } from './models/ChatSession';
import authRoutes from './routes/authRoutes';
import { protect, AuthRequest } from './middleware/auth';
import { initIo } from './socket';
import { uploadQueue } from './queue/uploadQueue';

dotenv.config();

const app = express();
const server = http.createServer(app);
initIo(server);

const PORT = process.env.PORT || 5000;
const PYTHON_API = process.env.PYTHON_API || 'http://127.0.0.1:8000';

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yashshukla0160_db_user:URhXYNaoCsdcCUyN@ai-rag.mnxzvy0.mongodb.net/insightrag?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas Cloud!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Auth Routes
app.use('/api/auth', authRoutes);

// Fetch Sessions
app.get('/api/sessions', protect, async (req: AuthRequest, res: Response) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user?.id }).sort({ updatedAt: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Fetch Chat History for a session
app.get('/api/history/:sessionId', protect, async (req: AuthRequest, res: Response) => {
    try {
        const history = await Chat.find({ 
            sessionId: req.params.sessionId,
            userId: req.user?.id 
        }).sort({ createdAt: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

// Async Background Upload using BullMQ
app.post('/api/upload', protect, upload.single('file'), async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const file = req.file;
        const sessionId = req.body.sessionId;
        if (!file) return res.status(400).json({ error: "No file uploaded" });

        // Add job to BullMQ
        const job = await uploadQueue.add('process-pdf', {
            userId: req.user?.id,
            filePath: file.path,
            originalName: file.originalname,
            mimetype: file.mimetype
        });

        // Save persistent record in chat history if sessionId exists
        if (sessionId) {
            await Chat.create({ 
                sessionId: sessionId,
                userId: req.user?.id,
                role: 'user', 
                content: `[File Uploaded]: ${file.originalname}` 
            });
            await Chat.create({ 
                sessionId: sessionId,
                userId: req.user?.id,
                role: 'ai', 
                content: `I have received ${file.originalname} and added it to my knowledge base. You can now ask me questions about it.` 
            });
        }

        // Immediately return 202 Accepted
        res.status(202).json({ 
            message: 'Upload received and is processing in the background.',
            jobId: job.id
        });
    } catch (error) {
        console.error("Upload Queue Error:", error);
        res.status(500).json({ error: 'Failed to queue file for processing' });
    }
});

// Proxy /ask to Python and Save to MongoDB
app.post('/api/ask', protect, async (req: AuthRequest, res: Response) => {
    try {
        const { question, sessionId, image } = req.body;
        let currentSessionId = sessionId;

        // Create new session if none provided
        if (!currentSessionId) {
            const newSession = await ChatSession.create({
                userId: req.user?.id,
                title: question.substring(0, 30) + "..."
            });
            currentSessionId = newSession._id;
        }

        // 1. Save User Question
        let contentToSave = question;
        if (image) {
             contentToSave = `[Attached Image] ${question}`;
        }
        await Chat.create({ 
            sessionId: currentSessionId,
            userId: req.user?.id,
            role: 'user', 
            content: contentToSave 
        });

        // 2. Fetch recent chat history for context
        const recentChats = await Chat.find({ sessionId: currentSessionId, userId: req.user?.id })
            .sort({ createdAt: -1 })
            .limit(6);
            
        // The DB query returns newest first, so reverse it for chronological order
        const history = recentChats.reverse().map(c => ({
            role: c.role,
            content: c.content
        }));

        // 3. Fetch streaming answer from Python AI
        const payload: any = { question, history };
        if (image) {
            payload.image_base64 = image;
        }

        const response = await fetch(`${PYTHON_API}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.body) {
            throw new Error("No response body from Python AI");
        }

        // Setup headers for streaming
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('X-Session-ID', currentSessionId.toString());
        res.setHeader('Access-Control-Expose-Headers', 'X-Session-ID');

        let fullAiAnswer = "";
        
        // standard fetch returns a web stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunkText = decoder.decode(value, { stream: true });
            fullAiAnswer += chunkText;
            res.write(chunkText);
        }

        res.end(); // Close the stream

        // 3. Save AI Answer to DB after stream finishes
        await Chat.create({ 
            sessionId: currentSessionId,
            userId: req.user?.id,
            role: 'ai', 
            content: fullAiAnswer 
        });
        
        // Update Session timestamp
        await ChatSession.findByIdAndUpdate(currentSessionId, { updatedAt: new Date() });

    } catch (error) {
        console.error("Ask Error:", error);
        // If headers are already sent, we can't send a 500 JSON response
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to query AI service' });
        } else {
            res.end();
        }
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Protected Backend running on http://localhost:${PORT}`);
});
