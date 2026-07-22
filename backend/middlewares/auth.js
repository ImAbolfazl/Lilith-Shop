import jwt from "jsonwebtoken"

export function authMiddleware(req, res, next) {
    const {authorization} = req.headers

    if(!authorization){return res.status(401).json({status: "unauthorized"})}

    jwt.verify(authorization, process.env.JWT_SECRET, (err, decoded) => {
        if(err){return res.status(401).json({status: "unauthorized"})}

        req.userId = decoded.id
        next()
    })
}