/*
arrange, act, assert 
arrange - подготовка данных для теста
act - выполнение тестируемого метода
assert - проверка результата
*/

import {jest, beforeEach} from '@jest/globals';

const mockRepository = {
    createStudent: jest.fn(),
    findStudentByID: jest.fn(),
    deleteStudentByID: jest.fn(),
    updateStudentByID: jest.fn(),
    findStudentsByName: jest.fn(),
    countStudentsByNames: jest.fn(),
    findStudentsByMinScore: jest.fn()
};

jest.unstable_mockModule('../src/repository/student_repo.js', () => mockRepository);

const studentService = await import('../src/service/service.js');

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Student Service', () => {
    describe('addStudent', () => {
        test('delegates createStudent to repository and returns its result', async () => {
            const student = { id: 1, name: 'Ann', password: 'secret' };
            mockRepository.createStudent.mockResolvedValue(true);

            const result = await studentService.addStudent(student);

            expect(mockRepository.createStudent).toHaveBeenCalledWith(student);
            expect(result).toBe(true);
        });
    });

    describe('findStudent', () => {
        test('returns student without password', async () => {
            mockRepository.findStudentByID.mockResolvedValue({
                id: 1,
                name: 'Ann',
                password: 'secret',
                scores: { java: 90 }
            });

            const result = await studentService.findStudent(1);

            expect(mockRepository.findStudentByID).toHaveBeenCalledWith(1);
            expect(result).toEqual({ id: 1, name: 'Ann', scores: { java: 90 } });
            expect(result.password).toBeUndefined();
        });

        test('returns null when student is not found', async () => {
            mockRepository.findStudentByID.mockResolvedValue(null);

            const result = await studentService.findStudent(999);

            expect(result).toBeNull();
        });
    });

    describe('deleteStudent', () => {
        test('returns deleted student without password', async () => {
            mockRepository.deleteStudentByID.mockResolvedValue({
                id: 2,
                name: 'Bob',
                password: 'pwd',
                scores: { js: 75 }
            });

            const result = await studentService.deleteStudent(2);

            expect(mockRepository.deleteStudentByID).toHaveBeenCalledWith(2);
            expect(result).toEqual({ id: 2, name: 'Bob', scores: { js: 75 } });
            expect(result.password).toBeUndefined();
        });

        test('returns null when repository returns null', async () => {
            mockRepository.deleteStudentByID.mockResolvedValue(null);

            const result = await studentService.deleteStudent(2);

            expect(result).toBeNull();
        });
    });

    describe('updateStudent', () => {
        test('returns null when student is not found', async () => {
            mockRepository.updateStudentByID.mockResolvedValue(null);

            const result = await studentService.updateStudent(3, { name: 'New Name' });

            expect(mockRepository.updateStudentByID).toHaveBeenCalledWith(3, { name: 'New Name' });
            expect(result).toBeNull();
        });

        test('returns updated student without scores', async () => {
            mockRepository.updateStudentByID.mockResolvedValue({
                id: 3,
                name: 'Carl',
                password: 'pwd',
                scores: { node: 88 }
            });

            const result = await studentService.updateStudent(3, { name: 'Carl' });

            expect(result).toEqual({ id: 3, name: 'Carl', password: 'pwd' });
            expect(result.scores).toBeUndefined();
        });
    });

    describe('addScore', () => {
        test('adds score and updates student when student exists', async () => {
            const existingStudent = {
                id: 4,
                name: 'Dana',
                password: 'pwd',
                scores: { java: 60 }
            };
            mockRepository.findStudentByID.mockResolvedValue(existingStudent);
            mockRepository.updateStudentByID.mockResolvedValue({ ...existingStudent, scores: { java: 60, js: 95 } });

            const result = await studentService.addScore('4', 'js', 95);

            expect(mockRepository.findStudentByID).toHaveBeenCalledWith(4);
            expect(mockRepository.updateStudentByID).toHaveBeenCalledWith(4, {
                id: 4,
                name: 'Dana',
                password: 'pwd',
                scores: { java: 60, js: 95 }
            });
            expect(result).toEqual({
                id: 4,
                name: 'Dana',
                password: 'pwd',
                scores: { java: 60, js: 95 }
            });
        });

        test('returns null and does not update when student is not found', async () => {
            mockRepository.findStudentByID.mockResolvedValue(null);

            const result = await studentService.addScore('5', 'js', 90);

            expect(mockRepository.findStudentByID).toHaveBeenCalledWith(5);
            expect(mockRepository.updateStudentByID).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('findStudentsByName', () => {
        test('returns students with password set to undefined', async () => {
            mockRepository.findStudentsByName.mockResolvedValue([
                { id: 1, name: 'Ann', password: 'p1', scores: {} },
                { id: 2, name: 'ANN', password: 'p2', scores: { java: 100 } }
            ]);

            const result = await studentService.findStudentsByName('ann', 2);

            expect(mockRepository.findStudentsByName).toHaveBeenCalledWith('ann', 2);
            expect(result).toEqual([
                { id: 1, name: 'Ann', password: undefined, scores: {} },
                { id: 2, name: 'ANN', password: undefined, scores: { java: 100 } }
            ]);
        });
    });

    describe('countStudentsByNames', () => {
        test('normalizes comma-separated names and delegates to repository', async () => {
            mockRepository.countStudentsByNames.mockResolvedValue(3);

            const result = await studentService.countStudentsByNames(' Ann, Bob , , Carl  ');

            expect(mockRepository.countStudentsByNames).toHaveBeenCalledWith(['Ann', 'Bob', 'Carl']);
            expect(result).toBe(3);
        });

        test('passes empty array when names are missing', async () => {
            mockRepository.countStudentsByNames.mockResolvedValue(0);

            const result = await studentService.countStudentsByNames(undefined);

            expect(mockRepository.countStudentsByNames).toHaveBeenCalledWith([]);
            expect(result).toBe(0);
        });
    });

    describe('findStudentsByMinScore', () => {
        test('casts minScore to number and hides passwords', async () => {
            mockRepository.findStudentsByMinScore.mockResolvedValue([
                { id: 1, name: 'Ann', password: 'p1', scores: { js: 91 } }
            ]);

            const result = await studentService.findStudentsByMinScore('js', '90', 3);

            expect(mockRepository.findStudentsByMinScore).toHaveBeenCalledWith('js', 90, 3);
            expect(result).toEqual([
                { id: 1, name: 'Ann', password: undefined, scores: { js: 91 } }
            ]);
        });
    });
});