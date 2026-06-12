import {fibonacci} from "./fibonacci.js";
import { describe, expect, test } from '@jest/globals';

describe('fibonacci', () => {
    test('should return the correct Fibonacci number for valid input', () => {
        expect(fibonacci(0)).toBe(0);
        expect(fibonacci(1)).toBe(1);
        expect(fibonacci(2)).toBe(1);
        expect(fibonacci(3)).toBe(2);
        expect(fibonacci(10)).toBe(55);
    });

    test('should throw an error for negative input', () => {
        expect(() => fibonacci(-1)).toThrow('Input must be a non-negative integer');
    });
});