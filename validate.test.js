import { validateEcmascriptText, validateDomainZone } from './index.js';

describe('validateEcmascriptText', () => {
    test('should return true for valid ecmascript text', () => {
        expect(validateEcmascriptText('ecmascript')).toBe(true);
        expect(validateEcmascriptText('ecmascript6')).toBe(true);
        expect(validateEcmascriptText('ECMASCRIPT10')).toBe(true);
        expect(validateEcmascriptText('   EcMaScRiPt16')).toBe(true);
    });

    test('should return false for invalid ecmascript text', () => {
        expect(validateEcmascriptText('ecmascript17')).toBe(false);
        expect(validateEcmascriptText('javascript')).toBe(false);
        expect(validateEcmascriptText('ecma script')).toBe(false);
    });
}); 

describe('validateDomainZone', () => {
    test('should return true for valid domain zones', () => {
        expect(validateDomainZone('example.com')).toBe(true);
        expect(validateDomainZone('my-site.org')).toBe(true);
        expect(validateDomainZone('test.il')).toBe(true);
    });

    test('should return false for invalid domain zones', () => {
        expect(validateDomainZone('example.net')).toBe(false);
        expect(validateDomainZone('examplе.сom')).toBe(false);
        expect(validateDomainZone('.com')).toBe(false);
        expect(validateDomainZone('example.')).toBe(false);
    });
});

import { removeDuplicates } from './iterator/iterable.js';

describe('removeDuplicates', () => {
    test('should remove duplicates from an array', () => {
        expect(removeDuplicates([1, 2, 2, 3, 4, 4, 5])).toEqual([1, 2, 3, 4, 5]);
        expect(removeDuplicates(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
        expect(removeDuplicates([])).toEqual([]);
    });
});
