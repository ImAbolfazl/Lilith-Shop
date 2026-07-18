import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const router = express.Router()

router.post("/register", (req, res) => {
    try{
        const {firstname, lastname, number, password} = req.body

        if(!firstname || !lastname || !number || !password){return res.status(400).json({status: "fail"})}
    }catch(err){
        console.log(err);
        
        return res.status(500).json({status: "error"})
    }
})

router.post("/login", (req, res) => {
    try{
        const {number, password} = req.body
        
    }catch{
        console.log(err);

        return res.status(500).json({status: "error"})
    }
})

export {router as authRouter}