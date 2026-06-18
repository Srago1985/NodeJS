import router from 'express';
import { addStudent, findStudent } from '../controller/student_controller.js';

const router = router();

router.post('/student', addStudent);
router.get('/student/:id', findStudent);

export default router;