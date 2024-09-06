module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/dist/tests/**/*.test.js'], // Aponta para os testes compilados
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
};