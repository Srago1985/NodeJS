import mongoose from 'mongoose';
import ForumPostModel from '../model/mongoose_post.js';

const normalizeTags = (values = []) => {
    const unique = new Map();

    for (const raw of values) {
        const normalized = String(raw || '').trim();
        if (!normalized) {
            continue;
        }

        const key = normalized.toLowerCase();
        if (!unique.has(key)) {
            unique.set(key, normalized);
        }
    }

    return [...unique.values()];
};

const normalizeTagsLower = (values = []) => normalizeTags(values).map((tag) => tag.toLowerCase());

const toObjectIdOrNull = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    return new mongoose.Types.ObjectId(id);
};

const mapComment = (comment) => ({
    user: comment.user,
    message: comment.message,
    dateCreated: new Date(comment.dateCreated).toISOString(),
    likes: comment.likes,
});

const mapPost = (post) => {
    if (!post) {
        return null;
    }

    return {
        id: String(post._id),
        title: post.title,
        content: post.content,
        author: post.author,
        dateCreated: new Date(post.dateCreated).toISOString(),
        tags: post.tags,
        likes: post.likes,
        comments: (post.comments || []).map(mapComment),
    };
};

const toRangeMs = (dateFrom, dateTo) => {
    const fromIsDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(dateFrom));
    const toIsDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(dateTo));

    const fromSource = fromIsDateOnly ? `${dateFrom}T00:00:00.000Z` : dateFrom;
    const toSource = toIsDateOnly ? `${dateTo}T23:59:59.999Z` : dateTo;

    return {
        from: new Date(fromSource).getTime(),
        to: new Date(toSource).getTime(),
    };
};

export const createPost = async (author, postData) => {
    const post = await ForumPostModel.create({
        title: postData.title,
        content: postData.content,
        author: String(author),
        tags: normalizeTags(postData.tags),
        likes: 0,
        comments: [],
    });

    return mapPost(post.toObject());
};

export const findPostById = async (postId) => {
    const objectId = toObjectIdOrNull(postId);
    if (!objectId) {
        return null;
    }

    const post = await ForumPostModel.findById(objectId).lean();
    return mapPost(post);
};

export const incrementPostLikes = async (postId) => {
    const objectId = toObjectIdOrNull(postId);
    if (!objectId) {
        return null;
    }

    const updated = await ForumPostModel.findByIdAndUpdate(
        objectId,
        { $inc: { likes: 1 } },
        { returnDocument: 'after' }
    ).lean();

    return mapPost(updated);
};

export const findPostsByAuthor = async (author) => {
    const normalizedAuthor = String(author || '').trim();
    if (!normalizedAuthor) {
        return [];
    }

    const posts = await ForumPostModel.find({ author: normalizedAuthor })
        .collation({ locale: 'en', strength: 2 })
        .lean();

    return posts.map(mapPost);
};

export const addCommentToPost = async (postId, commenter, message) => {
    const objectId = toObjectIdOrNull(postId);
    if (!objectId) {
        return null;
    }

    const comment = {
        user: String(commenter),
        message: String(message),
        dateCreated: new Date(),
        likes: 0,
    };

    const updated = await ForumPostModel.findByIdAndUpdate(
        objectId,
        { $push: { comments: comment } },
        { returnDocument: 'after' }
    ).lean();

    return mapPost(updated);
};

export const deletePostById = async (postId) => {
    const objectId = toObjectIdOrNull(postId);
    if (!objectId) {
        return null;
    }

    const deleted = await ForumPostModel.findByIdAndDelete(objectId).lean();
    return mapPost(deleted);
};

export const findPostsByTags = async (tags = []) => {
    const normalizedTags = normalizeTagsLower(tags);
    if (normalizedTags.length === 0) {
        return [];
    }

    const posts = await ForumPostModel.aggregate([
        {
            $addFields: {
                tagsLower: {
                    $map: {
                        input: '$tags',
                        as: 'tag',
                        in: { $toLower: '$$tag' },
                    },
                },
            },
        },
        {
            $match: {
                $expr: {
                    $gt: [
                        {
                            $size: {
                                $setIntersection: ['$tagsLower', normalizedTags],
                            },
                        },
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                tagsLower: 0,
            },
        },
    ]);

    return posts.map(mapPost);
};

export const findPostsByPeriod = async (dateFrom, dateTo) => {
    const { from, to } = toRangeMs(dateFrom, dateTo);
    if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return [];
    }

    const posts = await ForumPostModel.find({
        dateCreated: {
            $gte: new Date(from),
            $lte: new Date(to),
        },
    }).lean();

    return posts.map(mapPost);
};

export const updatePostById = async (postId, updates) => {
    const objectId = toObjectIdOrNull(postId);
    if (!objectId) {
        return null;
    }

    const updateDoc = {};
    const setDoc = {};

    if (Object.hasOwn(updates, 'title')) {
        setDoc.title = updates.title;
    }

    if (Object.hasOwn(updates, 'content')) {
        setDoc.content = updates.content;
    }

    if (Object.keys(setDoc).length > 0) {
        updateDoc.$set = setDoc;
    }

    if (Object.hasOwn(updates, 'tags')) {
        updateDoc.$addToSet = {
            tags: {
                $each: normalizeTags(updates.tags),
            },
        };
    }

    const updated = await ForumPostModel.findByIdAndUpdate(
        objectId,
        updateDoc,
        { returnDocument: 'after' }
    ).lean();
    return mapPost(updated);
};

export const resetForumRepo = async () => {
    await ForumPostModel.deleteMany({});
};
