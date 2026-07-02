import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const mockStudentService = {
	addStudent: jest.fn(),
	findStudent: jest.fn(),
	deleteStudent: jest.fn(),
	updateStudent: jest.fn(),
	addScore: jest.fn(),
	findStudentsByName: jest.fn(),
	countStudentsByNames: jest.fn(),
	findStudentsByMinScore: jest.fn()
};

// Mock service before importing routes so controller receives mocked dependency.
jest.unstable_mockModule('../src/service/service.js', () => mockStudentService);
const { default: router } = await import('../src/routes/students_routes.js');

const createApp = () => {
	const app = express();
	app.use(express.json());
	app.use(router);
	return app;
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe('Student Controller integration (router + controller)', () => {
	describe('POST /student', () => {
		test('returns 204 and calls service for a valid request', async () => {
			const app = createApp();
			const payload = {
				id: 10,
				name: 'Anna',
				password: 'qwerty',
				scores: { math: 95 }
			};
			mockStudentService.addStudent.mockResolvedValue(true);

			const response = await request(app).post('/student').send(payload);

			expect(response.status).toBe(204);
			expect(mockStudentService.addStudent).toHaveBeenCalledWith(payload);
		});

		test('returns 409 when service reports duplicate student', async () => {
			const app = createApp();
			mockStudentService.addStudent.mockResolvedValue(false);

			const response = await request(app)
				.post('/student')
				.send({ id: 10, name: 'Anna', password: 'qwerty' });

			expect(response.status).toBe(409);
			expect(mockStudentService.addStudent).toHaveBeenCalledTimes(1);
		});

		test('returns 400 for invalid body and does not call service', async () => {
			const app = createApp();

			const response = await request(app)
				.post('/student')
				.send({ id: 10, password: 'qwerty' });

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('Bad Request');
			expect(response.body.path).toBe('/student');
			expect(mockStudentService.addStudent).not.toHaveBeenCalled();
		});
	});

	describe('GET /student/:id', () => {
		test('returns 200 with student when found', async () => {
			const app = createApp();
			const student = { id: 10, name: 'Anna', scores: { math: 95 } };
			mockStudentService.findStudent.mockResolvedValue(student);

			const response = await request(app).get('/student/10');

			expect(response.status).toBe(200);
			expect(response.body).toEqual(student);
			expect(mockStudentService.findStudent).toHaveBeenCalledWith('10');
		});

		test('returns 404 when student is missing', async () => {
			const app = createApp();
			mockStudentService.findStudent.mockResolvedValue(null);

			const response = await request(app).get('/student/999');

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('Not Found');
			expect(response.body.path).toBe('/student/999');
		});
	});

	describe('DELETE /student/:id', () => {
		test('returns 200 when delete succeeds', async () => {
			const app = createApp();
			mockStudentService.deleteStudent.mockResolvedValue(true);

			const response = await request(app).delete('/student/10');

			expect(response.status).toBe(200);
			expect(mockStudentService.deleteStudent).toHaveBeenCalledWith('10');
		});

		test('returns 404 when student is not found', async () => {
			const app = createApp();
			mockStudentService.deleteStudent.mockResolvedValue(false);

			const response = await request(app).delete('/student/999');

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('Not Found');
			expect(response.body.path).toBe('/student/999');
		});
	});

	describe('PATCH /student/:id', () => {
		test('returns 200 and updated student for valid payload', async () => {
			const app = createApp();
			const patchData = { name: 'Ann Updated' };
			const updated = { id: 10, name: 'Ann Updated' };
			mockStudentService.updateStudent.mockResolvedValue(updated);

			const response = await request(app).patch('/student/10').send(patchData);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(updated);
			expect(mockStudentService.updateStudent).toHaveBeenCalledWith('10', patchData);
		});

		test('returns 400 for invalid patch payload and skips service call', async () => {
			const app = createApp();

			const response = await request(app)
				.patch('/student/10')
				.send({ id: 777 });

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('Bad Request');
			expect(response.body.path).toBe('/student/10');
			expect(mockStudentService.updateStudent).not.toHaveBeenCalled();
		});

		test('returns 404 when student to update does not exist', async () => {
			const app = createApp();
			mockStudentService.updateStudent.mockResolvedValue(null);

			const response = await request(app)
				.patch('/student/404')
				.send({ name: 'Ghost' });

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('Not Found');
			expect(response.body.path).toBe('/student/404');
		});
	});

	describe('PATCH /score/student/:id', () => {
		test('returns 204 for valid score payload', async () => {
			const app = createApp();
			mockStudentService.addScore.mockResolvedValue(true);

			const response = await request(app)
				.patch('/score/student/10')
				.send({ examName: 'math', score: 88 });

			expect(response.status).toBe(204);
			expect(mockStudentService.addScore).toHaveBeenCalledWith('10', 'math', 88);
		});

		test('returns 400 when score payload fails validation', async () => {
			const app = createApp();

			const response = await request(app)
				.patch('/score/student/10')
				.send({ score: 88 });

			expect(response.status).toBe(400);
			expect(response.body.error).toBe('Bad Request');
			expect(response.body.path).toBe('/student/10/score');
			expect(mockStudentService.addScore).not.toHaveBeenCalled();
		});

		test('returns 404 when target student is not found', async () => {
			const app = createApp();
			mockStudentService.addScore.mockResolvedValue(false);

			const response = await request(app)
				.patch('/score/student/404')
				.send({ examName: 'math', score: 88 });

			expect(response.status).toBe(404);
			expect(response.body.error).toBe('Not Found');
			expect(response.body.path).toBe('/student/404');
		});
	});

	describe('Collection endpoints', () => {
		test('GET /students/name/:name returns mapped list from service', async () => {
			const app = createApp();
			mockStudentService.findStudentsByName.mockResolvedValue([
				{ id: 1, name: 'Anna', scores: { js: 90 }, password: undefined }
			]);

			const response = await request(app).get('/students/name/Anna?page=2');

			expect(response.status).toBe(200);
			expect(response.body).toEqual([{ id: 1, name: 'Anna', scores: { js: 90 } }]);
			expect(mockStudentService.findStudentsByName).toHaveBeenCalledWith('Anna', '2');
		});

		test('GET /quantity/students forwards names query and returns count', async () => {
			const app = createApp();
			mockStudentService.countStudentsByNames.mockResolvedValue(3);

			const response = await request(app).get('/quantity/students?names=Ann,Bob,Carl');

			expect(response.status).toBe(200);
			expect(response.body).toBe(3);
			expect(mockStudentService.countStudentsByNames).toHaveBeenCalledWith('Ann,Bob,Carl');
		});

		test('GET /students/exam/:exam/minscore/:minScore returns filtered list', async () => {
			const app = createApp();
			mockStudentService.findStudentsByMinScore.mockResolvedValue([
				{ id: 5, name: 'Dan', scores: { node: 91 }, password: undefined }
			]);

			const response = await request(app).get('/students/exam/node/minscore/90?page=3');

			expect(response.status).toBe(200);
			expect(response.body).toEqual([{ id: 5, name: 'Dan', scores: { node: 91 } }]);
			expect(mockStudentService.findStudentsByMinScore).toHaveBeenCalledWith('node', '90', '3');
		});
	});
});
