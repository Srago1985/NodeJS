import Student from '../model/student.js'
import { getDb } from '../db.js';

export const getStudentsCollection = () => {
    return getDb().collection('students');
}

export const createStudent = async ({ id, name, password }) => {
    const collection = getStudentsCollection();
    const numericId = +id;

    if (!Number.isFinite(numericId)) {
        return false;
    }

    const existingStudent = await collection.findOne({ id: numericId });
    if (existingStudent) {
        return false;
    }

    const student = new Student(numericId, name, password);
    await collection.insertOne(student);
    return true;
} 

export const findStudentByID = async(id) => {
    const collection = getStudentsCollection();
    return collection.findOne({ id: +id }, { projection: { _id: 0 } });
    
}

export const deleteStudentByID = async (id) => {
    const collection = getStudentsCollection();
    const student = await collection.findOne({ id: +id }, { projection: { _id: 0 } });

    if (!student) {
        return null;
    }

    await collection.deleteOne({ id: +id });
    return student;
}

export const updateStudentByID = async(id, data) => {
    const collection = getStudentsCollection();
    const student = await collection.findOne({ id: +id });

    if (!student) {
        return null;
    }

    const updatedStudent = { ...student, ...data, id: +id };
    const { _id, ...dataToSave } = updatedStudent;

    await collection.updateOne(
        { id: +id },
        { $set: dataToSave }
    );

    return dataToSave;
}

export const findStudentsByName = async (name) => {
    const collection = getStudentsCollection();
    const students = await collection.find({}, { projection: { _id: 0 } }).toArray();
    return students.filter(student => student.name.toLowerCase() === name.toLowerCase());
}

export const countStudentsByNames = async (names = []) => {    
    const collection = getStudentsCollection();
    const students = await collection.find({}, { projection: { _id: 0 } }).toArray();
    if (!Array.isArray(names)) {
        names = String(names)
            .split(',')
            .map(name => name.trim())
            .filter(Boolean);
    }

    const lower = names.map(name => name.toLowerCase());
    return students.filter(student => lower.includes(student.name.toLowerCase())).length;
}

export const findStudentsByMinScore = async (exam, minScore) => {
    const collection = getStudentsCollection();
    const students = await collection.find({}, { projection: { _id: 0 } }).toArray();
    return students.filter(student => {
        const score = student.scores[exam];
        return score !== undefined && score >= +minScore;
    });
}