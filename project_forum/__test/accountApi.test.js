import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { createApp } from '../src/server.js';
import { closeMongooseConnection, connectToMongoose } from '../src/db.mongoose.js';

const app = createApp();

const basic = (login, password) => `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;

describe('Account API integration', () => {
    beforeAll(async () => {
        process.env.MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'java63';
        await connectToMongoose();
    });

    afterAll(async () => {
        await closeMongooseConnection();
    });

    test('POST /account/register -> 201 for new user', async () => {
        const login = `User${Date.now()}`;
        const response = await request(app)
            .post('/account/register')
            .send({ login, password: '1234', firstName: 'John', lastName: 'Smith' });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(
            expect.objectContaining({
                login,
                firstName: 'John',
                lastName: 'Smith',
                roles: ['USER'],
            })
        );
    });

    test('POST /account/register -> 409 for duplicate user', async () => {
        const login = `Dup${Date.now()}`;
        await request(app)
            .post('/account/register')
            .send({ login, password: '1234', firstName: 'John', lastName: 'Smith' });

        const response = await request(app)
            .post('/account/register')
            .send({ login, password: '1234', firstName: 'John', lastName: 'Smith' });

        expect(response.status).toBe(409);
    });

    test('POST /account/login -> 200 / 401', async () => {
        const ok = await request(app)
            .post('/account/login')
            .set('Authorization', basic('Apollo', '1234'));
        expect(ok.status).toBe(200);

        const unauthorized = await request(app)
            .post('/account/login')
            .set('Authorization', basic('Apollo', 'wrong'));
        expect(unauthorized.status).toBe(401);
    });

    test('PATCH /account/user/:user -> admin can update', async () => {
        const response = await request(app)
            .patch('/account/user/Apollo')
            .set('Authorization', basic('admin', 'admin'))
            .send({ firstName: 'Peter' });

        expect(response.status).toBe(200);
        expect(response.body.firstName).toBe('Peter');
    });

    test('PATCH /account/user/:user -> non-owner non-admin gets 403', async () => {
        const first = await request(app)
            .post('/account/register')
            .send({ login: `Victim${Date.now()}`, password: '1234', firstName: 'John', lastName: 'Smith' });

        const response = await request(app)
            .patch(`/account/user/${first.body.login}`)
            .set('Authorization', basic('Apollo', '1234'))
            .send({ firstName: 'Hack' });

        expect(response.status).toBe(403);
    });

    test('PATCH /account/user/:user/role/:role -> 200 for admin, 403 for non-admin', async () => {
        const login = `Role${Date.now()}`;
        await request(app)
            .post('/account/register')
            .send({ login, password: '1234', firstName: 'John', lastName: 'Smith' });

        const adminCall = await request(app)
            .patch(`/account/user/${login}/role/moderator`)
            .set('Authorization', basic('admin', 'admin'));

        expect(adminCall.status).toBe(200);
        expect(adminCall.body.roles).toContain('MODERATOR');

        const userCall = await request(app)
            .patch(`/account/user/${login}/role/editor`)
            .set('Authorization', basic('Apollo', '1234'));

        expect(userCall.status).toBe(403);
    });

    test('PATCH /account/password -> 204 on success, 401 on invalid old password', async () => {
        const login = `Pwd${Date.now()}`;
        await request(app)
            .post('/account/register')
            .send({ login, password: '1234', firstName: 'John', lastName: 'Smith' });

        const ok = await request(app)
            .patch('/account/password')
            .set('Authorization', basic(login, '1234'))
            .set('X-Password', '1234')
            .send({ password: 'newpassword' });

        expect(ok.status).toBe(204);

        const unauthorized = await request(app)
            .patch('/account/password')
            .set('Authorization', basic(login, 'newpassword'))
            .set('X-Password', 'wrong')
            .send({ password: 'another' });

        expect(unauthorized.status).toBe(401);
    });

    test('GET /account/user/:user -> 200 / 401', async () => {
        const ok = await request(app)
            .get('/account/user/Apollo')
            .set('Authorization', basic('Apollo', '1234'));
        expect(ok.status).toBe(200);

        const unauthorized = await request(app)
            .get('/account/user/Apollo')
            .set('Authorization', basic('Apollo', 'bad'));
        expect(unauthorized.status).toBe(401);
    });
});