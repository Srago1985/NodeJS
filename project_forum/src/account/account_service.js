import {
    addRoleToUser,
    createUser,
    deleteUserByLogin,
    findUserProfileByLogin,
    findUserRecordByLogin,
    removeRoleFromUser,
    updateUserPassword,
    updateUserProfile,
} from './account_repo.js';
import { cloneUserProfile, normalizeLogin, normalizeRole } from './account_model.js';

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

        return {
            login: decoded.slice(0, separatorIndex),
            password: decoded.slice(separatorIndex + 1),
        };
    } catch {
        return null;
    }
};

export const registerUser = async (payload) => createUser(payload);

export const authenticateUser = async (authorization) => {
    const credentials = decodeBasicAuth(authorization);
    if (!credentials) {
        return null;
    }

    const user = findUserRecordByLogin(credentials.login);
    if (!user || user.password !== credentials.password) {
        return null;
    }

    return cloneUserProfile(user);
};

export const findActor = async (authorization) => {
    const credentials = decodeBasicAuth(authorization);
    if (!credentials) {
        return null;
    }

    const user = findUserRecordByLogin(credentials.login);
    if (!user || user.password !== credentials.password) {
        return null;
    }

    return user;
};

export const getUserByLogin = async (login) => findUserProfileByLogin(login);

export const canManageUser = (actor, targetLogin) => {
    if (!actor) {
        return false;
    }

    const isAdmin = actor.roles.some((role) => normalizeRole(role) === 'ADMIN');
    return isAdmin || normalizeLogin(actor.login) === normalizeLogin(targetLogin);
};

export const canManageRoles = (actor) => actor?.roles.some((role) => normalizeRole(role) === 'ADMIN') || false;

export const patchUser = async (login, updates) => updateUserProfile(login, updates);

export const removeUser = async (login) => deleteUserByLogin(login);

export const grantRole = async (login, role) => addRoleToUser(login, role);

export const revokeRole = async (login, role) => {
    if (normalizeRole(role) === 'ADMIN') {
        return false;
    }

    return removeRoleFromUser(login, role);
};

export const changePassword = async (actor, oldPassword, newPassword) => {
    if (!actor || !oldPassword || actor.password !== oldPassword || !newPassword) {
        return false;
    }

    updateUserPassword(actor.login, newPassword);
    return true;
};
