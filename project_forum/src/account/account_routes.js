import { Router } from 'express';

const router = Router();

const users = new Map();

const normalizeLogin = (value) => String(value || '').trim().toLowerCase();
const normalizeRole = (value) => String(value || '').trim().toUpperCase();

const cloneUserProfile = (user) => ({
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: [...user.roles],
});

const upsertUser = ({ login, password, firstName, lastName, roles }) => {
    users.set(normalizeLogin(login), {
        login,
        password,
        firstName,
        lastName,
        roles: [...roles],
    });
};

upsertUser({
    login: 'admin',
    password: 'admin',
    firstName: 'System',
    lastName: 'Admin',
    roles: ['ADMIN', 'USER'],
});

upsertUser({
    login: 'Apollo',
    password: '1234',
    firstName: 'John',
    lastName: 'Smith',
    roles: ['USER'],
});

upsertUser({
    login: 'JavaFan',
    password: '1234',
    firstName: 'John',
    lastName: 'Smith',
    roles: ['USER'],
});

const decodeBasicAuth = (authorization) => {
    if (!authorization || !authorization.toLowerCase().startsWith('basic ')) {
        return null;
    }

    const encoded = authorization.slice(6).trim();
    if (!encoded) {
        return null;
    }

    try {
        const decoded = Buffer.from(encoded, 'base64').toString('utf8');
        const separatorIndex = decoded.indexOf(':');
        if (separatorIndex < 0) {
            return null;
        }

        const login = decoded.slice(0, separatorIndex);
        const password = decoded.slice(separatorIndex + 1);
        return { login, password };
    } catch {
        return null;
    }
};

const authenticate = (req) => {
    const credentials = decodeBasicAuth(req.get('authorization'));
    if (!credentials) {
        return null;
    }

    const user = users.get(normalizeLogin(credentials.login));
    if (!user || user.password !== credentials.password) {
        return null;
    }

    return user;
};

const isAdmin = (user) => user.roles.some((role) => normalizeRole(role) === 'ADMIN');
const isSameUser = (user, loginParam) => normalizeLogin(user.login) === normalizeLogin(loginParam);

router.post('/account/register', (req, res) => {
    const login = String(req.body?.login || '').trim();
    const password = String(req.body?.password || '');
    const firstName = String(req.body?.firstName || '').trim();
    const lastName = String(req.body?.lastName || '').trim();

    if (!login || !password || !firstName || !lastName) {
        return res.sendStatus(400);
    }

    const loginKey = normalizeLogin(login);
    if (users.has(loginKey)) {
        return res.sendStatus(409);
    }

    const created = {
        login,
        password,
        firstName,
        lastName,
        roles: ['USER'],
    };

    users.set(loginKey, created);
    return res.status(201).json(cloneUserProfile(created));
});

router.post('/account/login', (req, res) => {
    const user = authenticate(req);
    if (!user) {
        return res.sendStatus(401);
    }

    return res.status(200).json(cloneUserProfile(user));
});

router.get('/account/user/:user', (req, res) => {
    const actor = authenticate(req);
    if (!actor) {
        return res.sendStatus(401);
    }

    const target = users.get(normalizeLogin(req.params.user));
    if (!target) {
        return res.sendStatus(404);
    }

    return res.status(200).json(cloneUserProfile(target));
});

router.patch('/account/user/:user', (req, res) => {
    const actor = authenticate(req);
    if (!actor) {
        return res.sendStatus(401);
    }

    if (!isAdmin(actor) && !isSameUser(actor, req.params.user)) {
        return res.sendStatus(403);
    }

    const target = users.get(normalizeLogin(req.params.user));
    if (!target) {
        return res.sendStatus(404);
    }

    const nextFirstName = req.body?.firstName;
    const nextLastName = req.body?.lastName;
    if (nextFirstName !== undefined) {
        const value = String(nextFirstName).trim();
        if (!value) {
            return res.sendStatus(400);
        }
        target.firstName = value;
    }

    if (nextLastName !== undefined) {
        const value = String(nextLastName).trim();
        if (!value) {
            return res.sendStatus(400);
        }
        target.lastName = value;
    }

    return res.status(200).json(cloneUserProfile(target));
});

router.delete('/account/user/:user', (req, res) => {
    const actor = authenticate(req);
    if (!actor) {
        return res.sendStatus(401);
    }

    if (!isAdmin(actor) && !isSameUser(actor, req.params.user)) {
        return res.sendStatus(403);
    }

    const key = normalizeLogin(req.params.user);
    const target = users.get(key);
    if (!target) {
        return res.sendStatus(404);
    }

    users.delete(key);
    return res.status(200).json(cloneUserProfile(target));
});

router.patch('/account/user/:user/role/:role', (req, res) => {
    const actor = authenticate(req);
    if (!actor) {
        return res.sendStatus(401);
    }

    if (!isAdmin(actor)) {
        return res.sendStatus(403);
    }

    const target = users.get(normalizeLogin(req.params.user));
    if (!target) {
        return res.sendStatus(404);
    }

    const role = normalizeRole(req.params.role);
    if (!role) {
        return res.sendStatus(400);
    }

    if (!target.roles.some((existingRole) => normalizeRole(existingRole) === role)) {
        target.roles.push(role);
    }

    return res.status(200).json(cloneUserProfile(target));
});

router.delete('/account/user/:user/role/:role', (req, res) => {
    const actor = authenticate(req);
    if (!actor) {
        return res.sendStatus(401);
    }

    if (!isAdmin(actor)) {
        return res.sendStatus(403);
    }

    const target = users.get(normalizeLogin(req.params.user));
    if (!target) {
        return res.sendStatus(404);
    }

    const role = normalizeRole(req.params.role);
    if (!role || role === 'ADMIN') {
        return res.sendStatus(400);
    }

    target.roles = target.roles.filter((existingRole) => normalizeRole(existingRole) !== role);
    if (!target.roles.length) {
        target.roles = ['USER'];
    }

    return res.status(200).json(cloneUserProfile(target));
});

router.patch('/account/password', (req, res) => {
    const actor = authenticate(req);
    if (!actor) {
        return res.sendStatus(401);
    }

    const oldPassword = req.get('x-password');
    const newPassword = String(req.body?.password || '');
    if (!oldPassword || oldPassword !== actor.password || !newPassword) {
        return res.sendStatus(401);
    }

    actor.password = newPassword;
    return res.sendStatus(204);
});

export default router;