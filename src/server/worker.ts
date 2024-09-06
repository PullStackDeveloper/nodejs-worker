// src/server/worker.ts
const { fibonacci } = require('../utils/fibonacci');

// Listen for messages from the main process
process.on('message', (num: number) => {
        const result = fibonacci(num);
        if (process.send) process.send(result);
});
