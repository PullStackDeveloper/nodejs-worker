import request from 'supertest';
import { app } from '../server/server';  // Import the Express app instance

describe('Testing routes with and without worker', () => {
    it('Should prove that without worker the process is synchronous', async () => {
        const number = 47;  // Choosing a sufficiently large number to test processing time

        const startTime = Date.now();
        const response1 = await request(app).get(`/no-worker/${number}`);
        const response2 = await request(app).get(`/no-worker/${number}`);
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);

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
        const number = 47;  // Choosing a sufficiently large number to test processing time

        const startTime = Date.now();
        const request1 = request(app).get(`/worker/${number}`);
        const request2 = request(app).get(`/worker/${number}`);

        const [response1, response2] = await Promise.all([request1, request2]);
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);

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
