import { cloneUserProfile, createUserRecord, normalizeLogin, normalizeRole } from './account_model.js';

const users = new Map();

const seedUser = (userData) => {
    const user = createUserRecord(userData);
    users.set(normalizeLogin(user.login), user);
};

seedUser({
    login: 'admin',
    password: 'admin',
    firstName: 'System',
    lastName: 'Admin',
    roles: ['ADMIN', 'USER'],
});

seedUser({
    login: 'Apollo',
    password: '1234',
    firstName: 'John',
    lastName: 'Smith',
    roles: ['USER'],
});

seedUser({
    login: 'JavaFan',
    password: '1234',
    firstName: 'John',
    lastName: 'Smith',
    roles: ['USER'],
});

export const findUserRecordByLogin = (login) => users.get(normalizeLogin(login)) || null;

export const createUser = ({ login, password, firstName, lastName }) => {
    const loginKey = normalizeLogin(login);
    if (users.has(loginKey)) {
        return null;
    }

    const created = createUserRecord({
        login,
        password,
        firstName,
        lastName,
        roles: ['USER'],
    });

    users.set(loginKey, created);
    return cloneUserProfile(created);
};

export const findUserProfileByLogin = (login) => {
    const user = findUserRecordByLogin(login);
    return user ? cloneUserProfile(user) : null;
};

export const updateUserProfile = (login, updates) => {
    const user = findUserRecordByLogin(login);
    if (!user) {
        return null;
    }

    if (Object.hasOwn(updates, 'firstName')) {
        user.firstName = updates.firstName;
    }

    if (Object.hasOwn(updates, 'lastName')) {
        user.lastName = updates.lastName;
    }

    return cloneUserProfile(user);
};

export const deleteUserByLogin = (login) => {
    const loginKey = normalizeLogin(login);
    const user = users.get(loginKey);
    if (!user) {
        return null;
    }

    users.delete(loginKey);
    return cloneUserProfile(user);
};

export const addRoleToUser = (login, role) => {
    const user = findUserRecordByLogin(login);
    if (!user) {
        return null;
    }

    const normalizedRole = normalizeRole(role);
    if (!user.roles.some((existingRole) => normalizeRole(existingRole) === normalizedRole)) {
        user.roles.push(normalizedRole);
    }

    return cloneUserProfile(user);
};

export const removeRoleFromUser = (login, role) => {
    const user = findUserRecordByLogin(login);
    if (!user) {
        return null;
    }

    const normalizedRole = normalizeRole(role);
    user.roles = user.roles.filter((existingRole) => normalizeRole(existingRole) !== normalizedRole);
    if (!user.roles.length) {
        user.roles = ['USER'];
    }

    return cloneUserProfile(user);
};

export const updateUserPassword = (login, password) => {
    const user = findUserRecordByLogin(login);
    if (!user) {
        return null;
    }

    user.password = password;
    return cloneUserProfile(user);
};
