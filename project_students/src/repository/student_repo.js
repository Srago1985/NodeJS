import Student from '../model/student.js'

const students = new Map();

export const createStudent = ({id, name, password}) => {
    const numericId = +id;
    if (!Number.isFinite(numericId) || students.has(numericId)) {
        return false;
    }
    const student = new Student(numericId, name, password);
    students.set(numericId, student);
    return true;
} 

export const findStudentByID = (id) => {
    return students.get(+id);
}

export const deleteStudentByID = (id) => {
    let student = students.get(+id);
    students.delete(+id);
    return student; 
}

export const updateStudentByID = (id, data) => {
    let student = students.get(+id);
    if (student) {
        student = { ...student, ...data, id: +id };
        students.set(+id, student);
        return student;
    } 
}

export const findStudentsByName = (name) => {
    return [...students.values()].filter(student => student.name.toLowerCase() === name.toLowerCase());
}

export const countStudentsByNames = (names = []) => {
    const lower = names.map(n => n.toLowerCase());
    return [...students.values()].filter(s => lower.includes(s.name.toLowerCase())).length;
}

export const findStudentsByMinScore = (exam, minScore) => {
    return [...students.values()].filter(student => {
        const score = student.scores[exam];
        return score !== undefined && score >= minScore;
    });
}