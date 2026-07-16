import * as service from './account_service.js';
import * as validator from './account_validator.js';
import { isAllowedRole } from './account_model.js';

export const register = async (req, res) => {
    const { error, value } = validator.registerSchema.validate(req.body);
    if (error) {
        return res.sendStatus(400);
    }

    const created = await service.registerUser(value);
    if (!created) {
        return res.sendStatus(409);
    }

    return res.status(201).json(created);
};

export const login = async (req, res) => {
    const user = await service.authenticateUser(req.get('authorization'));
    if (!user) {
        return res.sendStatus(401);
    }

    return res.status(200).json(user);
};

export const getUser = async (req, res) => {
    const target = await service.getUserByLogin(req.params.user);
    if (!target) {
        return res.sendStatus(404);
    }

    return res.status(200).json(target);
};

export const updateUser = async (req, res) => {
    if (!service.canUpdateUser(req.actor, req.params.user)) {
        return res.sendStatus(403);
    }

    const { error, value } = validator.updateUserSchema.validate(req.body);
    if (error) {
        return res.sendStatus(400);
    }

    const updated = await service.patchUser(req.params.user, value);
    if (!updated) {
        return res.sendStatus(404);
    }

    return res.status(200).json(updated);
};

export const deleteUser = async (req, res) => {
    if (!service.canDeleteUser(req.actor, req.params.user)) {
        return res.sendStatus(403);
    }

    const deleted = await service.removeUser(req.params.user);
    if (!deleted) {
        return res.sendStatus(404);
    }

    return res.status(200).json(deleted);
};

export const addRole = async (req, res) => {
    if (!service.canManageRoles(req.actor)) {
        return res.sendStatus(403);
    }

    if (!isAllowedRole(req.params.role)) {
        return res.sendStatus(400);
    }

    const updated = await service.grantRole(req.params.user, req.params.role);
    if (!updated) {
        return res.sendStatus(404);
    }

    return res.status(200).json(updated);
};

export const deleteRole = async (req, res) => {
    if (!service.canManageRoles(req.actor)) {
        return res.sendStatus(403);
    }

    const removed = await service.revokeRole(req.params.user, req.params.role);
    if (removed === false) {
        return res.sendStatus(400);
    }

    if (!removed) {
        return res.sendStatus(404);
    }

    return res.status(200).json(removed);
};

export const updatePassword = async (req, res) => {
    const { error, value } = validator.changePasswordSchema.validate(req.body);
    if (error) {
        return res.sendStatus(400);
    }

    const changed = await service.changePassword(req.actor, req.get('x-password'), value.password);
    if (!changed) {
        return res.sendStatus(401);
    }

    return res.sendStatus(204);
};
