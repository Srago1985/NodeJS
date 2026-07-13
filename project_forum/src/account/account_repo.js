import bcrypt from 'bcryptjs';
import AccountUserModel from '../model/mongoose_user.js';
import { cloneUserProfile, normalizeLogin, normalizeRole } from './account_model.js';

const PASSWORD_SALT_ROUNDS = 10;

const mapUserRecord = (user) => {
    if (!user) {
        return null;
    }

    return {
        login: user.login,
        passwordHash: user.passwordHash || user.password || null,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [...(user.roles || [])],
    };
};

const migrateLegacyPasswordIfNeeded = async (user) => {
    if (!user || user.passwordHash || !user.password) {
        return user;
    }

    const passwordHash = await bcrypt.hash(user.password, PASSWORD_SALT_ROUNDS);
    await AccountUserModel.updateOne(
        { _id: user._id },
        { $set: { passwordHash }, $unset: { password: '' } }
    );

    return {
        ...user,
        passwordHash,
        password: undefined,
    };
};

const seedUsers = [
    {
        login: 'admin',
        password: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        roles: ['ADMIN', 'USER'],
    },
    {
        login: 'Apollo',
        password: '1234',
        firstName: 'John',
        lastName: 'Smith',
        roles: ['USER'],
    },
    {
        login: 'JavaFan',
        password: '1234',
        firstName: 'John',
        lastName: 'Smith',
        roles: ['USER'],
    },
];

export const seedAccountRepo = async () => {
    const operations = await Promise.all(seedUsers.map(async (user) => ({
        updateOne: {
            filter: { login: user.login },
            update: {
                $set: {
                    login: user.login,
                    passwordHash: await bcrypt.hash(user.password, PASSWORD_SALT_ROUNDS),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: user.roles,
                },
                $unset: { password: '' },
            },
            upsert: true,
            collation: { locale: 'en', strength: 2 },
        },
    })));

    await AccountUserModel.bulkWrite(operations, { ordered: true });
};

export const resetAccountRepo = async () => {
    await AccountUserModel.deleteMany({});
    await seedAccountRepo();
};

export const findUserRecordByLogin = async (login) => {
    const user = await AccountUserModel.findOne({ login: String(login || '').trim() })
        .collation({ locale: 'en', strength: 2 })
        .lean();

    const migratedUser = await migrateLegacyPasswordIfNeeded(user);

    return mapUserRecord(migratedUser);
};

export const createUser = async ({ login, password, firstName, lastName }) => {
    const existingUser = await findUserRecordByLogin(login);
    if (existingUser) {
        return null;
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    const created = await AccountUserModel.create({
        login: String(login).trim(),
        passwordHash,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        roles: ['USER'],
    });

    return cloneUserProfile(mapUserRecord(created.toObject()));
};

export const findUserProfileByLogin = async (login) => {
    const user = await findUserRecordByLogin(login);
    return user ? cloneUserProfile(user) : null;
};

export const updateUserProfile = async (login, updates) => {
    const setDoc = {};
    if (Object.hasOwn(updates, 'firstName')) {
        setDoc.firstName = updates.firstName;
    }

    if (Object.hasOwn(updates, 'lastName')) {
        setDoc.lastName = updates.lastName;
    }

    const updated = await AccountUserModel.findOneAndUpdate(
        { login: String(login || '').trim() },
        { $set: setDoc },
        { returnDocument: 'after', collation: { locale: 'en', strength: 2 } }
    ).lean();

    return updated ? cloneUserProfile(mapUserRecord(updated)) : null;
};

export const deleteUserByLogin = async (login) => {
    const deleted = await AccountUserModel.findOneAndDelete({ login: String(login || '').trim() }, {
        collation: { locale: 'en', strength: 2 },
    }).lean();

    return deleted ? cloneUserProfile(mapUserRecord(deleted)) : null;
};

export const addRoleToUser = async (login, role) => {
    const user = await findUserRecordByLogin(login);
    if (!user) {
        return null;
    }

    const normalizedRole = normalizeRole(role);
    const nextRoles = user.roles.some((existingRole) => normalizeRole(existingRole) === normalizedRole)
        ? user.roles
        : [...user.roles, normalizedRole];

    const updated = await AccountUserModel.findOneAndUpdate(
        { login: String(login || '').trim() },
        { $set: { roles: nextRoles } },
        { returnDocument: 'after', collation: { locale: 'en', strength: 2 } }
    ).lean();

    return updated ? cloneUserProfile(mapUserRecord(updated)) : null;
};

export const removeRoleFromUser = async (login, role) => {
    const user = await findUserRecordByLogin(login);
    if (!user) {
        return null;
    }

    const normalizedRole = normalizeRole(role);
    const nextRoles = user.roles.filter((existingRole) => normalizeRole(existingRole) !== normalizedRole);

    const updated = await AccountUserModel.findOneAndUpdate(
        { login: String(login || '').trim() },
        { $set: { roles: nextRoles.length ? nextRoles : ['USER'] } },
        { returnDocument: 'after', collation: { locale: 'en', strength: 2 } }
    ).lean();

    return updated ? cloneUserProfile(mapUserRecord(updated)) : null;
};

export const updateUserPassword = async (login, password) => {
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

    const updated = await AccountUserModel.findOneAndUpdate(
        { login: String(login || '').trim() },
        { $set: { passwordHash }, $unset: { password: '' } },
        { returnDocument: 'after', collation: { locale: 'en', strength: 2 } }
    ).lean();

    return updated ? cloneUserProfile(mapUserRecord(updated)) : null;
};
