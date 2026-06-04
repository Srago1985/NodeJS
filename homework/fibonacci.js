function* fibonacciIterator() {
    let a = 0;
    let b = 1;

    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

export function fibonacci(n) {
    if (n < 0) {
        throw new Error('Input must be a non-negative integer');
    }

    let index = 0;

    for (const value of fibonacciIterator()) {
        if (index === n) {
            return value;
        }

        index++;
    }
}