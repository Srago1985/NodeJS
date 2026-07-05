import * as service from '../service/forum_service.js';
import * as validator from '../validator/forumValidator.js';

const makeBadRequest = (path, message) => ({
    timestamp: new Date().toISOString(),
    status: 400,
    error: 'Bad Request',
    message,
    path,
});

const makePostNotFound = (req) => ({
    timestamp: new Date().toISOString(),
    status: 404,
    error: 'Not Found',
    message: `Post with id = ${req.params.postId} not found`,
    path: `/forum/post/${req.params.postId}`,
});

export const addPost = async (req, res) => {
    const { error } = validator.createPostSchema.validate(req.body);
    if (error) {
        return res.status(400).json(makeBadRequest(`/forum/post/${req.params.user}`, error.details.map((d) => d.message).join(', ')));
    }

    const post = await service.addPost(req.params.user, req.body);
    return res.status(201).json(post);
};

export const findPostById = async (req, res) => {
    const post = await service.findPostById(req.params.postId);
    if (!post) {
        return res.status(404).json(makePostNotFound(req));
    }

    return res.status(200).json(post);
};

export const addLike = async (req, res) => {
    const updated = await service.addLike(req.params.postId);
    if (!updated) {
        return res.status(404).json(makePostNotFound(req));
    }

    return res.status(204).send();
};

export const findPostsByAuthor = async (req, res) => {
    const posts = await service.findPostsByAuthor(req.params.user);
    return res.status(200).json(posts);
};

export const addComment = async (req, res) => {
    const { error } = validator.addCommentSchema.validate(req.body);
    if (error) {
        return res.status(400).json(makeBadRequest(`/forum/post/${req.params.postId}/comment/${req.params.commenter}`, error.details.map((d) => d.message).join(', ')));
    }

    const updated = await service.addComment(req.params.postId, req.params.commenter, req.body.message);
    if (!updated) {
        return res.status(404).json(makePostNotFound(req));
    }

    return res.status(200).json(updated);
};

export const deletePost = async (req, res) => {
    const deleted = await service.deletePost(req.params.postId);
    if (!deleted) {
        return res.status(404).json(makePostNotFound(req));
    }

    return res.status(200).json(deleted);
};

export const findPostsByTags = async (req, res) => {
    const { error } = validator.findByTagsSchema.validate(req.query);
    if (error) {
        return res.status(400).json(makeBadRequest('/forum/posts/tags', error.details.map((d) => d.message).join(', ')));
    }

    const posts = await service.findPostsByTags(req.query.values);
    return res.status(200).json(posts);
};

export const findPostsByPeriod = async (req, res) => {
    const { error } = validator.findByPeriodSchema.validate(req.query);
    if (error) {
        return res.status(400).json(makeBadRequest('/forum/posts/period', error.details.map((d) => d.message).join(', ')));
    }

    const posts = await service.findPostsByPeriod(req.query.dateFrom, req.query.dateTo);
    return res.status(200).json(posts);
};

export const updatePost = async (req, res) => {
    const { error } = validator.updatePostSchema.validate(req.body);
    if (error) {
        return res.status(400).json(makeBadRequest(`/forum/post/${req.params.postId}`, error.details.map((d) => d.message).join(', ')));
    }

    const updated = await service.updatePost(req.params.postId, req.body);
    if (!updated) {
        return res.status(404).json(makePostNotFound(req));
    }

    return res.status(200).json(updated);
};
