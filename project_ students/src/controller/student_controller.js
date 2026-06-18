import * as service from '../service/service.js';

const notFound = (req) => ({
    timestamp: new Date().toISOString(),
    status: 404,
    error: 'Not Found',
    message: `Student with id ${req.params.id} not found`,
    path: `/student/${req.params.id}`,
});

export const addStudent = async (req, res) => {
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
    const success = await service.updateStudent(req.params.id, req.body);
    if (success) {
        res.status(200).json({
                id: req.params.id,
                name: req.body.name,
                password: req.body.password
            });
    } else {
        res.status(404).json(notFound(req));
    }
}

export const addScore = async (req, res) => {
    const success = await service.addScore(req.params.id, req.body.exam, req.body.score);
    if (success) {
        res.status(204).send();
    } else {
        res.status(404).json(notFound(req));
    }
};

export const findStudentsByName = async (req, res) => {
    const students = await service.findStudentsByName(req.params.name);
    res.status(200).json(
        students.map(student => ({
            id: student.id,
            name: student.name,
            scores: student.scores
        }))
    )
};

export const countStudentsByNames = async (req, res) => {
    const count = await service.countStudentsByNames(req.query.names);
    res.status(200).send({ count });
};

export const findStudentsByMinScore = async (req, res) => {
    const students = await service.findStudentsByMinScore(req.params.exam, req.params.minScore);
    res.status(200).json(
        students.map(student => ({
            id: student.id,
            name: student.name,
            scores: student.scores
        }))
    )
};