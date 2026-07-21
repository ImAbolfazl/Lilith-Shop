import { getUserById } from "../src/db.js";

export function roleMiddleware(req, res, next) {
    const id = req.userId

    const user = getUserById(id)
    
    if(user.role != "admin"){return res.status(403)}
    
    next()
}