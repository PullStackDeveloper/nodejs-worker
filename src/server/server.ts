// src/server/server.ts
import express from 'express';
import { fork } from 'child_process';
import path from 'path';
import { fibonacci } from '../utils/fibonacci';

export const app = express();
const port = 3000;

// Route without Workers or Clusters
app.get('/no-worker/:number', (req, res) => {
    const num = parseInt(req.params.number, 10);
    const start = Date.now();
    const startTime = new Date(start).toISOString();
    const result = fibonacci(num);
    const end = Date.now();
    const endTime = new Date(end).toISOString();
    const duration = end - start;
    res.send(`Result: ${result}, Start time: ${startTime}, End time: ${endTime}, Duration: ${duration} ms`);
});

// Route using Workers
app.get('/worker/:number', (req, res) => {
    const num = parseInt(req.params.number, 10);
    const start = Date.now();
    const startTime = new Date(start).toISOString();
    const worker = fork(path.resolve(__dirname, 'worker.js'));
    worker.send(num);
    worker.on('message', (result) => {
        const end = Date.now();
        const endTime = new Date(end).toISOString();
        const duration = end - start;
        res.send(`Result: ${result}, Start time: ${startTime}, End time: ${endTime}, Duration: ${duration} ms`);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
