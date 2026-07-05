import { Router } from 'express';
import {
    addPost,
    findPostById,
    addLike,
    findPostsByAuthor,
    addComment,
    deletePost,
    findPostsByTags,
    findPostsByPeriod,
    updatePost,
} from '../controller/forum_controller.js';

const router = Router();

router.post('/forum/post/:user', addPost);
router.get('/forum/post/:postId', findPostById);
router.patch('/forum/post/:postId/like', addLike);
router.get('/forum/posts/author/:user', findPostsByAuthor);
router.patch('/forum/post/:postId/comment/:commenter', addComment);
router.delete('/forum/post/:postId', deletePost);
router.get('/forum/posts/tags', findPostsByTags);
router.get('/forum/posts/period', findPostsByPeriod);
router.patch('/forum/post/:postId', updatePost);

export default router;
