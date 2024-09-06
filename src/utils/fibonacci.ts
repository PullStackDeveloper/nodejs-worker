// export function fibonacci(n: number): number[] {
//     if (n < 1) return [n];
//     let finalNumber = 1;
//     let prevNumber = 0
//     let result = [1];
//     for (let i = 1; i < n; i ++) {
//         //console.log(result)
//         result.push(finalNumber + prevNumber);
//         prevNumber = finalNumber;
//         finalNumber = result[i];
//     }
//     return result;
// }

export function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}