import { getUserById } from "../src/db.js";

export async function roleMiddleware(req, res, next) {
    const id = req.userId

    const user = await getUserById(id)
    
    if(user.role != "admin"){return res.status(403)}

    req.role = user.role
    
    next()
}