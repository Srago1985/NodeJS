import Joi from 'joi';

export const studentSchema = Joi.object({
    name: Joi.string().required(),
    id: Joi.number().integer().positive().required(),
    password: Joi.string().required(),
    scores: Joi.object().pattern(
        Joi.string().min(1).max(100),
        Joi.number().min(0).max(100)
    ).optional()
});

export const updateStudentSchema = Joi.object({
    name: Joi.string().optional(),
    password: Joi.string().optional(),    
});

export const scoreSchema = Joi.object({
    examName: Joi.string().required(),
    score: Joi.number().integer().min(0).max(100).required()
});
