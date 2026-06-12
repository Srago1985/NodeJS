function fibonacciIterator() {
    let a = 0;
    let b = 1;

    return {
        next: function() {
            const value = a;
            [a, b] = [b, a + b];
            return { value, done: false };
        },
        [Symbol.iterator]: function() {
            return this;
        }
    };
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