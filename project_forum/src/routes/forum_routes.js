import { Router } from 'express';
import {
    addPost,
    findPostById,
    findPosts,
    addLike,
    findPostsByAuthor,
    addComment,
    deletePost,
    findPostsByTags,
    findPostsByPeriod,
    updatePost,
} from '../controller/forum_controller.js';
import { authenticateUser } from '../auth/auth_middleware.js';

const router = Router();

router.get('/forum/posts', findPosts);

router.post('/forum/post/:user', authenticateUser, addPost);
router.get('/forum/post/:postId', authenticateUser, findPostById);
router.patch('/forum/post/:postId/like', authenticateUser, addLike);
router.get('/forum/posts/author/:user', authenticateUser, findPostsByAuthor);
router.patch('/forum/post/:postId/comment/:commenter', authenticateUser, addComment);
router.delete('/forum/post/:postId', authenticateUser, deletePost);
router.get('/forum/posts/tags', authenticateUser, findPostsByTags);
router.get('/forum/posts/period', authenticateUser, findPostsByPeriod);
router.patch('/forum/post/:postId', authenticateUser, updatePost);

export default router;
