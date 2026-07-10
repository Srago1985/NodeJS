import { loginViaUserAccount } from './user_account_client.js';

const buildError = (status, error, message, pathValue) => ({
    timestamp: new Date().toISOString(),
    status,
    error,
    message,
    path: pathValue,
});

export const authenticateUser = async (req, res, next) => {
    const authorization = req.get('authorization');
    if (!authorization) {
        return res
            .status(401)
            .json(buildError(401, 'Unauthorized', 'Authorization header is required', req.originalUrl));
    }

    if (!authorization.toLowerCase().startsWith('basic ')) {
        return res
            .status(401)
            .json(buildError(401, 'Unauthorized', 'Basic authorization is required', req.originalUrl));
    }

    try {
        const { authorized, user } = await loginViaUserAccount(authorization);
        if (!authorized) {
            return res
                .status(401)
                .json(buildError(401, 'Unauthorized', 'Invalid credentials', req.originalUrl));
        }

        req.authUser = user;
        return next();
    } catch (error) {
        console.error('UserAccount authorization failed', error);
        return res
            .status(502)
            .json(buildError(502, 'Bad Gateway', 'UserAccount service is unavailable', req.originalUrl));
    }
};