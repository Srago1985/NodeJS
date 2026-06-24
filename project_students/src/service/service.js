import * as repo from '../repository/student_repo.js';


export const addStudent = async (student) => {
    return repo.createStudent(student);
}

export const findStudent = async (id) => {
    let student = await repo.findStudentByID(id);
    let student_copy = student ? { ...student } : null;
    delete student_copy?.password;
    return student_copy;    
}

export const deleteStudent = async (id) => {
    let student = await repo.deleteStudentByID(id);
    delete student?.password;
    return student;    
}

export const updateStudent = async (id, data) => {
    const student = await repo.updateStudentByID(id, data);
    if (!student) {
        return null;
    }

    const student_copy = { ...student };
    delete student_copy.scores;
    return student_copy;
}

export const addScore = async (id, exam, score) => {
    let student = await repo.findStudentByID(+id);
    if (student) {
        student.scores[exam] = score;
        await repo.updateStudentByID(+id, student);
    }
    return student;
}

export const findStudentsByName = async (name) => {
        return (await repo.findStudentsByName(name)).map(student => ({...student, password: undefined}));
}

export const countStudentsByNames = async (names) => {
    const normalized = String(names || '')
        .split(',')
        .map(n => n.trim())
        .filter(Boolean);

    return await repo.countStudentsByNames(normalized);
}

export const findStudentsByMinScore = async (exam, minScore) => {
    return (await repo.findStudentsByMinScore(exam, +minScore)).map(student => ({...student, password: undefined}));
}