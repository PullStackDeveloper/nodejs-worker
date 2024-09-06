### Tutorial: Implementing Heavy Operations with and Without Workers in Node.js

This tutorial will guide you step-by-step through the creation of a Node.js project that compares the performance of a heavy operation (calculating Fibonacci numbers) executed with and without worker threads. We'll set up the project from scratch, configure all necessary files, and explain the code to help you understand how worker threads can improve performance.

#### **Step 1: Initialize the Project**

1. **Create a new directory for your project:**

   ```bash
   mkdir nodejs-cluster-worker
   cd nodejs-cluster-worker
   ```

2. **Initialize a new Node.js project:**

   ```bash
   npm init -y
   ```

   This command will create a `package.json` file with the default settings.

#### **Step 2: Install Required Dependencies**

Install the necessary dependencies and development tools:

```bash
npm install express typescript ts-node @types/node @types/express --save
npm install jest ts-jest @types/jest supertest @types/supertest --save-dev
```

- **`express`**: A web framework for Node.js.
- **`typescript`**: A typed superset of JavaScript that compiles to plain JavaScript.
- **`ts-node`**: Allows us to run TypeScript directly.
- **`jest`**: A testing framework.
- **`ts-jest`**: A TypeScript preprocessor for Jest.
- **`supertest`**: An HTTP assertion library for testing HTTP endpoints.

#### **Step 3: Configure TypeScript**

Create a `tsconfig.json` file to configure TypeScript:

```json
{
  "compilerOptions": {
    "target": "ES2020", // Specifies the target ECMAScript version
    "module": "commonjs", // Specifies the module system
    "strict": true, // Enables strict type-checking options
    "esModuleInterop": true, // Enables emit interoperability between CommonJS and ES modules
    "skipLibCheck": true, // Skips type checking of declaration files
    "forceConsistentCasingInFileNames": true, // Ensures consistent casing in file names
    "outDir": "./dist", // Output directory for compiled files
    "rootDir": "./src", // Root directory of the input files
    "types": ["jest", "node"], // Includes types for Jest and Node.js
    "resolveJsonModule": true, // Allows importing JSON files
    "moduleResolution": "node" // Specifies module resolution strategy
  },
  "include": ["src/**/*", "src/tests/**/*.test.ts"] // Includes all files in src directory and tests
}
```

#### **Step 4: Configure Jest**

Create a `jest.config.js` file to configure Jest:

```js
module.exports = {
    preset: 'ts-jest', // Use ts-jest preset for testing TypeScript files
    testEnvironment: 'node', // Defines the testing environment as Node.js
    testMatch: ['**/dist/tests/**/*.test.js'], // Looks for compiled test files in the dist directory
    moduleFileExtensions: ['ts', 'js'], // Recognizes both TypeScript and JavaScript files
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }], // Transforms TypeScript files using ts-jest
    },
};
```

#### **Step 5: Set Up the Project Structure**

Create the following directory structure:

```plaintext
nodejs-cluster-worker/
├── src/
│   ├── server/
│   │   ├── cluster.ts
│   │   ├── server.ts
│   │   └── worker.ts
│   ├── tests/
│   │   ├── server.test.js
│   │   └── server.test.ts
│   └── utils/
│       └── fibonacci.ts
├── jest.config.js
├── package.json
└── tsconfig.json
```

#### **Step 6: Implement the Fibonacci Utility Function**

Create `src/utils/fibonacci.ts`:

```typescript
// src/utils/fibonacci.ts

/**
 * Calculates the nth Fibonacci number using recursion.
 * @param n - The position of the desired Fibonacci number.
 * @returns The nth Fibonacci number.
 */
export function fibonacci(n: number): number {
    if (n <= 1) return n; // Base case: if n is 0 or 1, return n.
    return fibonacci(n - 1) + fibonacci(n - 2); // Recursive case.
}
```

#### **Step 7: Set Up the Worker**

Create `src/server/worker.ts`:

```typescript
// src/server/worker.ts

import { fibonacci } from '../utils/fibonacci';

// Listen for messages from the main process
process.on('message', (num: number) => {
    const result = fibonacci(num); // Calculate Fibonacci number
    if (process.send) process.send(result); // Send the result back to the main process
});
```

#### **Step 8: Implement the Server**

Create `src/server/server.ts`:

```typescript
// src/server/server.ts

import express from 'express'; // Import express for server creation
import { fork } from 'child_process'; // Import fork to create child processes
import path from 'path'; // Import path for handling file paths
import { fibonacci } from '../utils/fibonacci'; // Import Fibonacci function

export const app = express();
const port = 3000;

// Route without Workers or Clusters
app.get('/no-worker/:number', (req, res) => {
    const num = parseInt(req.params.number, 10); // Parse number from request parameters
    const start = Date.now(); // Record the start time
    const startTime = new Date(start).toISOString(); // Convert start time to ISO format
    const result = fibonacci(num); // Perform heavy computation synchronously
    const end = Date.now(); // Record the end time
    const endTime = new Date(end).toISOString(); // Convert end time to ISO format
    const duration = end - start; // Calculate the duration
    res.send(`Result: ${result}, Start time: ${startTime}, End time: ${endTime}, Duration: ${duration} ms`);
});

// Route using Workers
app.get('/worker/:number', (req, res) => {
    const num = parseInt(req.params.number, 10); // Parse number from request parameters
    const start = Date.now(); // Record the start time
    const startTime = new Date(start).toISOString(); // Convert start time to ISO format
    const worker = fork(path.resolve(__dirname, 'worker.js')); // Fork a new process for the worker
    worker.send(num); // Send the number to the worker process
    worker.on('message', (result) => {
        const end = Date.now(); // Record the end time
        const endTime = new Date(end).toISOString(); // Convert end time to ISO format
        const duration = end - start; // Calculate the duration
        res.send(`Result: ${result}, Start time: ${startTime}, End time: ${endTime}, Duration: ${duration} ms`);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`); // Start the server
});
```

#### **Step 9: Create Tests**

Create `src/tests/server.test.ts`:

```typescript
// src/tests/server.test.ts

import request from 'supertest'; // Import supertest for HTTP assertions
import { app } from '../server/server'; // Import the Express app instance

describe('Testing routes with and without worker', () => {
    it('Should prove that without worker the process is synchronous', async () => {
        const number = 47; // Choosing a sufficiently large number to test processing time

        const startTime = Date.now(); // Record the start time
        const response1 = await request(app).get(`/no-worker/${number}`); // First request
        const response2 = await request(app).get(`/no-worker/${number}`); // Second request
        const endTime = Date.now(); // Record the end time
        const duration = endTime - startTime; // Calculate the duration

        expect(response1.status).toBe(200); // Ensure first request is successful
        expect(response2.status).toBe(200); // Ensure second request is successful

        // Check that responses are returned sequentially
        const match1 = response1.text.match(/End time: ([\d\-T:.Z]+)/);
        const match2 = response2.text.match(/End time: ([\d\-T:.Z]+)/);

        if (match1 && match2) {
            const time1 = new Date(match1[1]).getTime();
            const time2 = new Date(match2[1]).getTime();
            expect(time2).toBeGreaterThanOrEqual(time1);
            console.log(`Duration without worker: ${duration} ms`);
        } else {
            throw new Error('Failed to extract end time from response.');
        }
    }, 100000); // Increase timeout to 100 seconds

    it('Should prove that with worker the process occurs in parallel', async () => {
        const number = 47; // Choosing a sufficiently large number to test processing time

        const startTime = Date.now(); // Record the start time
        const request1 = request(app).get(`/worker/${number}`);
        const request2 = request(app).get(`/worker/${number}`);

        const [response1, response2] = await Promise.all([request1, request2]); // Execute both requests in parallel


        const endTime = Date.now(); // Record the end time
        const duration = endTime - startTime; // Calculate the duration

        expect(response1.status).toBe(200); // Ensure first request is successful
        expect(response2.status).toBe(200); // Ensure second request is successful

        // Check that responses are returned in parallel
        const match1 = response1.text.match(/End time: ([\d\-T:.Z]+)/);
        const match2 = response2.text.match(/End time: ([\d\-T:.Z]+)/);

        if (match1 && match2) {
            const time1 = new Date(match1[1]).getTime();
            const time2 = new Date(match2[1]).getTime();
            console.log(`Duration with worker: ${duration} ms`);
        } else {
            throw new Error('Failed to extract end time from response.');
        }
    }, 100000); // Increase timeout to 100 seconds
});
```

#### **Step 10: Run the Project**

1. **Compile TypeScript files:**

   ```bash
   npx tsc
   ```

   This command will compile TypeScript files into JavaScript and place them in the `dist` directory.

2. **Run the server:**

   ```bash
   node dist/server/server.js
   ```

   The server should start on `http://localhost:3000`.

3. **Run the tests:**

   ```bash
   npm test
   ```

   Jest will run the tests, and you will see output indicating that the worker route is faster than the non-worker route.

#### **Conclusion**

By following this tutorial, you learned how to set up a Node.js project that compares performance using worker threads for heavy computations versus running them in the main thread. This approach helps in understanding how worker threads can significantly improve performance by handling tasks in parallel.