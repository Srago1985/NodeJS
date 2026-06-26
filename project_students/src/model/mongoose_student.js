import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    scores: { type: Map, of: Number, default: {} }
}, { versionKey: false });

studentSchema.index({ id: 1 }, { unique: true, name: 'idx_students_id_unique' });
studentSchema.index({ name: 1 }, { name: 'idx_students_name_ci', collation: { locale: 'en', strength: 2 } });
studentSchema.index({ 'scores.$**': 1 }, { name: 'idx_students_scores_wildcard' });

const StudentModel = mongoose.models.Student || mongoose.model('Student', studentSchema);

export default StudentModel;