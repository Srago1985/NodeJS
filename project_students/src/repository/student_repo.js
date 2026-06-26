import StudentModel from "../model/mongoose_student.js";

const toNumericId = (id) => Number(id);

export const createStudent = async ({ id, name, password }) => {    
    const numericId = toNumericId(id);
    if (!Number.isFinite(numericId)) {
        return false;
    }

    try {
        await StudentModel.create({ id: numericId, name, password, scores: {} });
        return true;        
    } catch (error) {
        if (error.code === 11000) {
            return false;
        } 
        throw error;
    }
} 

export const findStudentByID = async(id) => {
    const numericId = toNumericId(id);
    return StudentModel.findOne({ id: numericId }).select("-_id").lean();
    
}

export const deleteStudentByID = async (id) => {    
    const numericId = toNumericId(id);
    return StudentModel.findOneAndDelete({ id: numericId }).select("-_id").lean();
}

export const updateStudentByID = async(id, data) => {
    const numericId = toNumericId(id);
    const dataToUpdate = { ...data };
    delete dataToUpdate.id;
    delete dataToUpdate._id;
    return StudentModel.findOneAndUpdate(
        { id: numericId }, 
        { $set: { ...dataToUpdate, id: numericId } }, 
        { returnDocument: 'after', runValidators: true }
    ).select("-_id").lean();
};

export const findStudentsByName = async (name) => {
    return StudentModel.find({ name: String(name) })
        .collation({ locale: 'en', strength: 2 })
        .select("-_id")
        .lean();
}

export const countStudentsByNames = async (names = []) => {    
    if (!Array.isArray(names)) {
        names = String(names)
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean);
    }

    if (names.length === 0) {
        return 0;
    }
    const normalizedNames = names.map((n) => String(n).trim()).filter(Boolean);
    return StudentModel.countDocuments({ name: { $in: normalizedNames }})
    .collation({ locale: 'en', strength: 2 })
};

export const findStudentsByMinScore = async (exam, minScore) => {
    const numericMinScore = Number(minScore);

    if (!Number.isFinite(numericMinScore)) {
        return [];
    }

    const scoreField = `scores.${exam}`;
    return StudentModel.find({ [scoreField]: { $gte: numericMinScore } })
        .select("-_id")
        .lean();
}