import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const router = express.Router()

router.post("/register", (req, res) => {
    try{
        const {firstname, lastname, gmail, number, password} = req.body

        if(!firstname || !lastname || !gmail || !number || !password){return res.status(400).json({status: "fail"})}
    }catch(err){
        console.log(err);
        
        return res.status(500).json({status: "error"})
    }
})

export {router as authRouter}