import * as service from './account_service.js';

export const requireAccountActor = async (req, res, next) => {
    const actor = await service.findActor(req.get('authorization'));
    if (!actor) {
        return res.sendStatus(401);
    }

    req.actor = actor;
    return next();
};
