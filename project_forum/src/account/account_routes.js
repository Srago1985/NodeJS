import { Router } from 'express';
import {
    addRole,
    deleteRole,
    deleteUser,
    getUser,
    login,
    register,
    updatePassword,
    updateUser,
} from './account_controller.js';
import { requireAccountActor } from './account_auth_middleware.js';

const router = Router();

router.post('/account/register', register);
router.post('/account/login', login);

router.use('/account', requireAccountActor);

router.get('/account/user/:user', getUser);
router.patch('/account/user/:user', updateUser);
router.delete('/account/user/:user', deleteUser);
router.patch('/account/user/:user/role/:role', addRole);
router.delete('/account/user/:user/role/:role', deleteRole);
router.patch('/account/password', updatePassword);

export default router;