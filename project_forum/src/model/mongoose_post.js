import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    likes: { type: Number, required: true, default: 0, min: 0 },
}, { _id: false });

const forumPostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    tags: [{ type: String, required: true, trim: true }],
    likes: { type: Number, required: true, default: 0, min: 0 },
    comments: { type: [commentSchema], default: [] },
}, {
    versionKey: false,
    collection: 'forum',
});

forumPostSchema.index({ author: 1 }, {
    name: 'idx_forum_author_ci',
    collation: { locale: 'en', strength: 2 },
});
forumPostSchema.index({ tags: 1 }, { name: 'idx_forum_tags' });
forumPostSchema.index({ dateCreated: 1 }, { name: 'idx_forum_date_created' });
forumPostSchema.index({ dateCreated: 1, author: 1 }, { name: 'idx_forum_date_author' });

const ForumPostModel = mongoose.models.ForumPost || mongoose.model('ForumPost', forumPostSchema);

export default ForumPostModel;
