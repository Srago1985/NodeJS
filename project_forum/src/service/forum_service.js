import * as repo from '../repository/forum_repo.js';

export const addPost = async (author, postData) => repo.createPost(author, postData);

export const findPostById = async (postId) => repo.findPostById(postId);

export const addLike = async (postId) => repo.incrementPostLikes(postId);

export const findPostsByAuthor = async (author) => repo.findPostsByAuthor(author);

export const addComment = async (postId, commenter, message) => (
    repo.addCommentToPost(postId, commenter, message)
);

export const deletePost = async (postId) => repo.deletePostById(postId);

export const findPostsByTags = async (values) => {
    const tags = String(values || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

    return repo.findPostsByTags(tags);
};

export const findPostsByPeriod = async (dateFrom, dateTo) => (
    repo.findPostsByPeriod(dateFrom, dateTo)
);

export const updatePost = async (postId, updates) => repo.updatePostById(postId, updates);
