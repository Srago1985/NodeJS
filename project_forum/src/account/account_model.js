export const normalizeLogin = (value) => String(value || '').trim().toLowerCase();
export const normalizeRole = (value) => String(value || '').trim().toUpperCase();
export const ALLOWED_ROLES = new Set(['USER', 'ADMIN', 'MODERATOR']);

export const isAllowedRole = (value) => ALLOWED_ROLES.has(normalizeRole(value));

export const cloneUserProfile = (user) => ({
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: [...user.roles],
});

export const createUserRecord = ({ login, passwordHash, firstName, lastName, roles }) => ({
    login,
    passwordHash,
    firstName,
    lastName,
    roles: [...roles],
});
