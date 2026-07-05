import Joi from 'joi';

const title = Joi.string().trim().min(1).max(200);
const content = Joi.string().trim().min(1).max(5000);
const tags = Joi.array().items(Joi.string().trim().min(1).max(100)).min(1);

export const createPostSchema = Joi.object({
    title: title.required(),
    content: content.required(),
    tags: tags.required(),
});

export const updatePostSchema = Joi.object({
    title,
    content,
    tags,
}).min(1);

export const addCommentSchema = Joi.object({
    message: Joi.string().trim().min(1).max(1000).required(),
});

export const findByTagsSchema = Joi.object({
    values: Joi.string().trim().min(1).required(),
});

export const findByPeriodSchema = Joi.object({
    dateFrom: Joi.date().iso().required(),
    dateTo: Joi.date().iso().required(),
}).custom((value, helpers) => {
    const from = new Date(value.dateFrom).getTime();
    const to = new Date(value.dateTo).getTime();

    if (from > to) {
        return helpers.error('any.invalid');
    }

    return value;
}, 'date range validation').messages({
    'any.invalid': 'dateFrom must be less than or equal to dateTo',
});
