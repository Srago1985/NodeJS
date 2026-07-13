export const normalizeLogin = (value) => String(value || '').trim().toLowerCase();
export const normalizeRole = (value) => String(value || '').trim().toUpperCase();

export const cloneUserProfile = (user) => ({
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: [...user.roles],
});

export const createUserRecord = ({ login, password, firstName, lastName, roles }) => ({
    login,
    password,
    firstName,
    lastName,
    roles: [...roles],
});
