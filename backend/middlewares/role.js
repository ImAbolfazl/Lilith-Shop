import { getUserById } from "../src/db";

export function roleMiddleware(req, res, next) {
    const id = req.userId

    const user = getUserById(id)
    
    if(user.role == "admin"){
        req.role = "admin"
    }else if(user.role == "moderator"){
        req.role = "moderator"
    }else if(user.role == "user"){
        req.role = "user"
    }

    next()
}