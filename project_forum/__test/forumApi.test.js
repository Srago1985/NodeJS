import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { createApp } from '../src/server.js';
import { resetForumRepo } from '../src/repository/forum_repo.js';
import { closeMongooseConnection, connectToMongoose } from '../src/db.mongoose.js';

const AUTH_HEADERS = {
    Apollo: 'Basic QXBvbGxvOjEyMzQ=',
    Another: 'Basic QW5vdGhlcjoyMzQ1',
    Stranger: 'Basic U3RyYW5nZXI6MTIzNA==',
};

const originalFetch = global.fetch;

const authHeaderByLogin = Object.entries(AUTH_HEADERS).reduce((acc, [login, header]) => {
    acc[header] = login;
    return acc;
}, {});

const buildPostPayload = () => ({
    title: 'JavaEE',
    content: 'Java is the best for backend',
    tags: ['Java', 'Spring', 'backend', 'JEE'],
});

const expectErrorShape = (response, status, error, path, messagePart) => {
    expect(response.status).toBe(status);
    expect(response.body.status).toBe(status);
    expect(response.body.error).toBe(error);
    expect(response.body.path).toBe(path);
    expect(typeof response.body.timestamp).toBe('string');
    if (messagePart) {
        expect(response.body.message).toContain(messagePart);
    }
};

describe('Forum API contract integration', () => {
    let app;
    const withAuth = (requestBuilder, login = 'Apollo') => requestBuilder.set('Authorization', AUTH_HEADERS[login]);
    const post = (path, login = 'Apollo') => withAuth(request(app).post(path), login);
    const get = (path, login = 'Apollo') => withAuth(request(app).get(path), login);
    const patch = (path, login = 'Apollo') => withAuth(request(app).patch(path), login);
    const del = (path, login = 'Apollo') => withAuth(request(app).delete(path), login);

    beforeAll(async () => {
        process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'java63';
        await connectToMongoose();
    });

    beforeEach(async () => {
        await resetForumRepo();
        global.fetch = jest.fn(async (url, options = {}) => {
            const authHeader = options.headers?.Authorization;
            const login = authHeaderByLogin[authHeader];

            if (!login) {
                return {
                    ok: false,
                    status: 401,
                    json: async () => ({}),
                };
            }

            return {
                ok: true,
                status: 200,
                json: async () => ({
                    login,
                    firstName: 'John',
                    lastName: 'Smith',
                    roles: ['USER'],
                }),
            };
        });
        app = createApp();
    });

    afterAll(async () => {
        await resetForumRepo();
        await closeMongooseConnection();
        global.fetch = originalFetch;
    });

    test('Protected routes require Authorization header (401)', async () => {
        const response = await request(app).get('/forum/posts/tags?values=java');

        expectErrorShape(response, 401, 'Unauthorized', '/forum/posts/tags?values=java', 'Authorization header is required');
    });

    test('POST /forum/post/:user creates post (201)', async () => {
        const response = await post('/forum/post/Apollo')
            .send(buildPostPayload());

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                title: 'JavaEE',
                content: 'Java is the best for backend',
                author: 'Apollo',
                dateCreated: expect.any(String),
                tags: expect.arrayContaining(['Java', 'Spring', 'backend', 'JEE']),
                likes: 0,
                comments: [],
            })
        );
    });

    test('POST /forum/post/:user invalid body returns 400', async () => {
        const response = await post('/forum/post/Apollo')
            .send({ title: '', tags: [] });

        expectErrorShape(response, 400, 'Bad Request', '/forum/post/Apollo');
    });

    test('GET /forum/post/:postId returns created post (200)', async () => {
        const created = await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const response = await get(`/forum/post/${created.body.id}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(created.body.id);
    });

    test('GET /forum/post/:postId unknown id returns 404', async () => {
        const response = await get('/forum/post/unknown-id');

        expectErrorShape(response, 404, 'Not Found', '/forum/post/unknown-id', 'Post with id = unknown-id not found');
    });

    test('PATCH /forum/post/:postId/like returns 204 and increments likes', async () => {
        const created = await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const likeResponse = await patch(`/forum/post/${created.body.id}/like`);
        const getResponse = await get(`/forum/post/${created.body.id}`);

        expect(likeResponse.status).toBe(204);
        expect(getResponse.body.likes).toBe(1);
    });

    test('PATCH /forum/post/:postId/like unknown id returns 404', async () => {
        const response = await patch('/forum/post/unknown-id/like');

        expectErrorShape(response, 404, 'Not Found', '/forum/post/unknown-id', 'Post with id = unknown-id not found');
    });

    test('GET /forum/posts/author/:user returns author posts (200)', async () => {
        await post('/forum/post/Apollo').send(buildPostPayload());
        await post('/forum/post/Another', 'Another').send(buildPostPayload());

        const response = await get('/forum/posts/author/apollo');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].author).toBe('Apollo');
    });

    test('PATCH /forum/post/:postId/comment/:commenter returns updated post (200)', async () => {
        const created = await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const response = await patch(`/forum/post/${created.body.id}/comment/Stranger`, 'Stranger')
            .send({ message: 'Awesome!!!' });

        expect(response.status).toBe(200);
        expect(response.body.comments).toHaveLength(1);
        expect(response.body.comments[0]).toEqual(
            expect.objectContaining({
                user: 'Stranger',
                message: 'Awesome!!!',
                likes: 0,
                dateCreated: expect.any(String),
            })
        );
    });

    test('PATCH /forum/post/:postId/comment/:commenter invalid body returns 400', async () => {
        const created = await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const response = await patch(`/forum/post/${created.body.id}/comment/Stranger`, 'Stranger')
            .send({});

        expectErrorShape(response, 400, 'Bad Request', `/forum/post/${created.body.id}/comment/Stranger`);
    });

    test('PATCH /forum/post/:postId/comment/:commenter unknown id returns 404', async () => {
        const response = await patch('/forum/post/unknown-id/comment/Stranger', 'Stranger')
            .send({ message: 'Awesome!!!' });

        expectErrorShape(response, 404, 'Not Found', '/forum/post/unknown-id', 'Post with id = unknown-id not found');
    });

    test('DELETE /forum/post/:postId returns deleted post (200)', async () => {
        const created = await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const response = await del(`/forum/post/${created.body.id}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(created.body.id);
    });

    test('DELETE /forum/post/:postId unknown id returns 404', async () => {
        const response = await del('/forum/post/unknown-id');

        expectErrorShape(response, 404, 'Not Found', '/forum/post/unknown-id', 'Post with id = unknown-id not found');
    });

    test('GET /forum/posts/tags returns posts by matching tags (200)', async () => {
        await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const response = await get('/forum/posts/tags?values=python,java,j2ee');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test('GET /forum/posts/tags missing values returns 400', async () => {
        const response = await get('/forum/posts/tags');

        expectErrorShape(response, 400, 'Bad Request', '/forum/posts/tags');
    });

    test('GET /forum/posts/period returns posts by date range (200)', async () => {
        await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const today = new Date().toISOString().slice(0, 10);
        const response = await get(`/forum/posts/period?dateFrom=${today}&dateTo=${today}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test('GET /forum/posts/period invalid range returns 400', async () => {
        const response = await get('/forum/posts/period?dateFrom=2026-06-01&dateTo=2026-05-01');

        expectErrorShape(response, 400, 'Bad Request', '/forum/posts/period', 'dateFrom must be less than or equal to dateTo');
    });

    test('PATCH /forum/post/:postId updates post fields (200)', async () => {
        const created = await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const response = await patch(`/forum/post/${created.body.id}`)
            .send({ title: 'Jakarta EE', tags: ['Jakarta EE', 'J2EE'] });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Jakarta EE');
        expect(response.body.tags).toEqual(expect.arrayContaining(['Java', 'Jakarta EE', 'J2EE']));
    });

    test('PATCH /forum/post/:postId invalid payload returns 400', async () => {
        const created = await post('/forum/post/Apollo')
            .send(buildPostPayload());

        const response = await patch(`/forum/post/${created.body.id}`)
            .send({});

        expectErrorShape(response, 400, 'Bad Request', `/forum/post/${created.body.id}`);
    });

    test('PATCH /forum/post/:postId unknown id returns 404', async () => {
        const response = await patch('/forum/post/unknown-id')
            .send({ title: 'Jakarta EE' });

        expectErrorShape(response, 404, 'Not Found', '/forum/post/unknown-id', 'Post with id = unknown-id not found');
    });

    test('Unknown route returns unified 404 schema', async () => {
        const response = await get('/forum/unknown');

        expectErrorShape(response, 404, 'Not Found', '/forum/unknown', 'Route GET /forum/unknown not found');
    });
});
