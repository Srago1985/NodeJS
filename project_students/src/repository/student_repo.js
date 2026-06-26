import Student from '../model/student.js'
import { getDb } from '../db.js';

export const getStudentsCollection = () => {
    return getDb().collection('students');
}

const toNumericId = (id) => Number(id);

export const createStudent = async ({ id, name, password }) => {
    const collection = getStudentsCollection();
    const numericId = toNumericId(id);

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
    const numericId = toNumericId(id);
    return collection.findOne({ id: numericId }, { projection: { _id: 0 } });
    
}

export const deleteStudentByID = async (id) => {
    const collection = getStudentsCollection();
    const numericId = toNumericId(id);
    const student = await collection.findOne({ id: numericId }, { projection: { _id: 0 } });

    if (!student) {
        return null;
    }

    await collection.deleteOne({ id: numericId });
    return student;
}

export const updateStudentByID = async(id, data) => {
    const collection = getStudentsCollection();
    const numericId = toNumericId(id);
    const student = await collection.findOne({ id: numericId });

    if (!student) {
        return null;
    }

    const updatedStudent = { ...student, ...data, id: numericId };
    const { _id, ...dataToSave } = updatedStudent;

    await collection.updateOne(
        { id: numericId },
        { $set: dataToSave }
    );

    return dataToSave;
}

export const findStudentsByName = async (name) => {
    const collection = getStudentsCollection();
    return collection
        .find({ name: String(name) }, { projection: { _id: 0 }, collation: { locale: 'en', strength: 2 } })
        .toArray();
}

export const countStudentsByNames = async (names = []) => {    
    const collection = getStudentsCollection();
    if (!Array.isArray(names)) {
        names = String(names)
            .split(',')
            .map(name => name.trim())
            .filter(Boolean);
    }

    if (names.length === 0) {
        return 0;
    }

    const normalizedNames = names.map(name => String(name));
    return collection.countDocuments(
        { name: { $in: normalizedNames } },
        { collation: { locale: 'en', strength: 2 } }
    );
}

export const findStudentsByMinScore = async (exam, minScore) => {
    const collection = getStudentsCollection();
    const numericMinScore = Number(minScore);

    if (!Number.isFinite(numericMinScore)) {
        return [];
    }

    const scoreField = `scores.${exam}`;
    return collection.find({ [scoreField]: { $gte: numericMinScore } }, { projection: { _id: 0 } }).toArray();
}