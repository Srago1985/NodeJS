import * as service from '../service/service.js';
import * as validator from '../validator/studentValidator.js';

const notFound = (req) => ({
    timestamp: new Date().toISOString(),
    status: 404,
    error: 'Not Found',
    message: `Student with id ${req.params.id} not found`,
    path: `/student/${req.params.id}`,
});

export const addStudent = async (req, res) => {
    const { error } = validator.studentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            status: 400,
            error: 'Bad Request',
            message: error.details.map(detail => detail.message).join(', '),
            path: '/student'
        });
    }
    const success = await service.addStudent(req.body);
    if (success) {
        res.status(204).send();
    } else {
        res.status(409).send();
    }
};

export const findStudent = async (req, res) => {
    const student = await service.findStudent(req.params.id);
    if (student) {
        return res.json(student);
    } else {
        return res.status(404).json(notFound(req));
    }
};

export const deleteStudent = async (req, res) => {
    const success = await service.deleteStudent(req.params.id);
    if (success) {
        res.status(200).send();
    } else {
        res.status(404).json(notFound(req));
    }
};

export const updateStudent = async (req, res) => {
    const { error } = validator.updateStudentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            status: 400,
            error: 'Bad Request',
            message: error.details.map(detail => detail.message).join(', '),
            path: `/student/${req.params.id}`
        });
    }
    const student = await service.updateStudent(req.params.id, req.body);
    if (student) {
        res.status(200).json(student);
    } else {
        res.status(404).json(notFound(req));
    }
}

export const addScore = async (req, res) => {
    const { error } = validator.scoreSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            timestamp: new Date().toISOString(),
            status: 400,
            error: 'Bad Request',
            message: error.details.map(detail => detail.message).join(', '),
            path: `/student/${req.params.id}/score`
        });
    }
    const success = await service.addScore(req.params.id, req.body.examName, req.body.score);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).json(notFound(req));
    }
};

export const findStudentsByName = async (req, res) => {
    const page = req.query.page;
    const students = await service.findStudentsByName(req.params.name, page);
    res.status(200).json(
        students.map(student => ({
            id: student.id,
            name: student.name,
            scores: student.scores
        }))
    )
};

export const countStudentsByNames = async (req, res) => {
    const names = req.query.names ?? req.query.name ?? req.query['names[]'];
    const count = await service.countStudentsByNames(names);
    res.status(200).json(count);
};

export const findStudentsByMinScore = async (req, res) => {
    const page = req.query.page;
    const students = await service.findStudentsByMinScore(req.params.exam, req.params.minScore, page);
    res.status(200).json(
        students.map(student => ({
            id: student.id,
            name: student.name,
            scores: student.scores
        }))
    )
};