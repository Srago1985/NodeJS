import Joi from 'joi';

const login = Joi.string().trim().min(1).max(100);
const password = Joi.string().min(1).max(200);
const firstName = Joi.string().trim().min(1).max(100);
const lastName = Joi.string().trim().min(1).max(100);

export const registerSchema = Joi.object({
    login: login.required(),
    password: password.required(),
    firstName: firstName.required(),
    lastName: lastName.required(),
});

export const updateUserSchema = Joi.object({
    firstName,
    lastName,
}).min(1);

export const changePasswordSchema = Joi.object({
    password: password.required(),
});
