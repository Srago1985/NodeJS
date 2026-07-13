import mongoose from 'mongoose';

const accountUserSchema = new mongoose.Schema({
    login: { type: String, required: true, trim: true },
    password: { type: String, required: false },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    roles: {
        type: [{ type: String, required: true, trim: true }],
        default: ['USER'],
    },
}, {
    versionKey: false,
    collection: 'account_users',
});

accountUserSchema.index(
    { login: 1 },
    {
        unique: true,
        name: 'uidx_account_login_ci',
        collation: { locale: 'en', strength: 2 },
    }
);

const AccountUserModel = mongoose.models.AccountUser || mongoose.model('AccountUser', accountUserSchema);

export default AccountUserModel;