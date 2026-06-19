import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import fs from 'fs';
import { getIo } from '../socket';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const PYTHON_API = process.env.PYTHON_API || 'http://127.0.0.1:8000';

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const uploadQueue = new Queue('uploadQueue', { connection: connection as any });

const worker = new Worker('uploadQueue', async (job: Job) => {
    const { userId, filePath, originalName, mimetype } = job.data;
    
    try {
        console.log(`[Worker] Started processing file ${originalName} for user ${userId}`);
        const io = getIo();
        
        // Let frontend know we started
        io.to(`user_${userId}`).emit('upload_progress', {
            fileName: originalName,
            status: 'processing'
        });

        const fileData = fs.readFileSync(filePath);
        const blob = new Blob([fileData], { type: mimetype });
        
        const formData = new FormData();
        formData.append('file', blob, originalName);

        const response = await fetch(`${PYTHON_API}/upload`, {
            method: 'POST',
            body: formData,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Python API upload failed');
        }

        // Notify frontend of success
        io.to(`user_${userId}`).emit('upload_complete', {
            fileName: originalName,
            status: 'success',
            result: data
        });
        
        console.log(`[Worker] Finished processing file ${originalName} for user ${userId}`);
        
    } catch (error: any) {
        console.error(`[Worker] Error processing file ${originalName}:`, error.message);
        const io = getIo();
        io.to(`user_${userId}`).emit('upload_error', {
            fileName: originalName,
            error: error.message
        });
        throw error;
    } finally {
        // Clean up file regardless of success or failure
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}, { connection: connection as any });

worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
});
