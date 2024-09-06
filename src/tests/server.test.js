"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("./server");
describe('Testing /no-worker and /worker endpoints', () => {
    it('should process /no-worker in sequence and /worker in parallel', async () => {
        const numberToTest = 40; // Número grande para testar a diferença de performance
        const start = Date.now();
        // Envia duas requisições simultâneas para o endpoint '/no-worker/:number'
        const [noWorkerRes1, noWorkerRes2] = await Promise.all([
            (0, supertest_1.default)(server_1.app).get(`/no-worker/${numberToTest}`),
            (0, supertest_1.default)(server_1.app).get(`/no-worker/${numberToTest}`)
        ]);
        const endNoWorker = Date.now();
        // Envia duas requisições simultâneas para o endpoint '/worker/:number'
        const [workerRes1, workerRes2] = await Promise.all([
            (0, supertest_1.default)(server_1.app).get(`/worker/${numberToTest}`),
            (0, supertest_1.default)(server_1.app).get(`/worker/${numberToTest}`)
        ]);
        const endWorker = Date.now();
        // Verifica se o resultado de ambos os endpoints está correto
        expect(noWorkerRes1.status).toBe(200);
        expect(noWorkerRes2.status).toBe(200);
        expect(workerRes1.status).toBe(200);
        expect(workerRes2.status).toBe(200);
        // Verifica que o tempo de processamento da rota 'no-worker' é maior que da rota 'worker'
        const noWorkerDuration = endNoWorker - start;
        const workerDuration = endWorker - endNoWorker;
        expect(noWorkerDuration).toBeGreaterThan(workerDuration);
        console.log(`Duração /no-worker: ${noWorkerDuration} ms`);
        console.log(`Duração /worker: ${workerDuration} ms`);
    });
});
