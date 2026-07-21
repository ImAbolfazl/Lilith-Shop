import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import axios from "axios"
import crypto from "crypto"
import { createUser, getUserByNumber } from "../src/db"

const router = express.Router()

const pendingRegistration = new Map()
const pendingLogin = new Map()
setInterval(() => {
    const now = Date.now();

    for (const [number, data] of pendingRegistration) {
        if (data.expiresAt < now)
            pendingRegistration.delete(number);
    }

    for (const [number, data] of pendingLogin) {
        if (data.expiresAt < now)
            pendingLogin.delete(number);
    }
}, 60000);

router.post("/register", async (req, res) => {
    try{
        const {firstname, lastname, number, password} = req.body
        try{
            if(!firstname || !lastname || !number || !password){return res.status(400).json({status: "fail"})}

            const user = await getUserByNumber(number)
            if(user){return res.status(400).json({status: "fail", data: "user already exists"})}

            const verificationCode = crypto.randomInt(10000, 99999)
            const  response = await axios({
                method: "post",
                url: "https://api.sms.ir/v1/send/verify",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain',
                    'x-api-key': process.env.SMS_API_KEY
                },
                data:{
                    "mobile": number,
                    "templateId": process.env.SMS_TEMPLATE_ID,
                    "parameters": [
                    {
                        "name": "VERIFICATIONCODE",
                        "value": verificationCode.toString()
                    }
                    ]
                }
            })
            if(response.data.message != "موفق"){return res.status(500).json({status: "error", data: "something went wrong while sending the message"})}

            const encryptedPassword = await bcrypt.hash(password, 10)
            pendingRegistration.set(number, {
                firstname: firstname,
                lastname: lastname,
                password: encryptedPassword,
                verificationCode: verificationCode,
                expiresAt: Date.now() + 5 * 60 * 1000
            })
            res.status(200).json({status: "success", data: "verfication code sent"})

        }catch(err){
            console.log(err);
            res.status(400).json({status: "error"})
        }

    }catch(err){
        console.log(err);
        res.status(500).json({status: "error"})
    }
})

router.post("/login", async (req, res) => {
    try{
        const {number, password} = req.body
        try{
            const user = await getUserByNumber(number)
            if(!user){return res.status(404).json({status: "fail", data: "user does not exist"})}

            const isPasswordValid = await bcrypt.compare(password, user.password)

            if(!isPasswordValid){return res.status(400).json({status: "fail", data:"number or password is invalid"})}

            const token = jwt.sign({id: user.id}, process.env.JWT_TOKEN, {expiresIn: "7d"})

            res.status(200).json({status: "success", token: token})
        }catch(err){
            console.log(err);
            res.status(500).json({status:"error"});
        }
        
    }catch{
        console.log(err);
        return res.status(500).json({status: "error"})
    }
})

router.post("/loginWithNumber", async (req, res) => {
    try{
        const {number} = req.body
        try{
            if(!number){return res.status(400).json({status: "fail"})}

            const user = await getUserByNumber(number)
            if(!user){return res.status(400).json({status: "fail", data: "user does not exist"})}

            const verificationCode = crypto.randomInt(10000, 99999)
            const  response = await axios({
                method: "post",
                url: "https://api.sms.ir/v1/send/verify",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain',
                    'x-api-key': process.env.SMS_API_KEY
                },
                data:{
                    "mobile": number,
                    "templateId": process.env.SMS_TEMPLATE_ID,
                    "parameters": [
                    {
                        "name": "VERIFICATIONCODE",
                        "value": verificationCode.toString()
                    }
                    ]
                }
            })
            if(response.data.message != "موفق"){return res.status(500).json({status: "error", data: "something went wrong while sending the message"})}

            pendingLogin.set(number, {
                verificationCode: verificationCode,
                expiresAt: Date.now() + 5 * 60 * 1000
            })

            res.status(200).json({status: "success", data: "verfication code sent"})

        }catch(err){
            console.log(err);
            res.status(400).json({status: "error"})
        }
    }catch(err){
        console.log(err);
        res.status(500).json({status: "error"})
    }
})

router.post("/verifyLogin", async (req, res) => {
    try{
        const {number, code} = req.body
        const savedData = pendingLogin.get(number)

        if (!savedData) {
            return res.status(400).json({
                status: "fail",
                data: "No verification request."
            });
        }
        if(Date.now() > savedData.expiresAt){
            pendingLogin.delete(number)
            return res.status(400).json({status: "fail", data: "sms timer expired"})
        }

        if(code != savedData.verificationCode){
            return res.status(400).json({status: "fail", data:"wrong code"})
        }

        pendingLogin.delete(number)
        const user = await getUserByNumber(number)

        const token = jwt.sign({id: user.id}, process.env.JWT_TOKEN, {expiresIn: "7d"})

        res.status(201).json({status: "success", token: token})
    }catch(err){
        console.log(err);
        res.status(500).json({status:"error"});
    }
})

router.post("/verifyRegister", async (req, res) => {
    try{
        const {number, code} = req.body
        const savedData = pendingRegistration.get(number)

        if (!savedData) {
            return res.status(400).json({
                status: "fail",
                data: "No verification request."
            });
        }
        if(Date.now() > savedData.expiresAt){
            pendingRegistration.delete(number)
            return res.status(400).json({status: "fail", data: "sms timer expired"})
        }

        if(code != savedData.verificationCode){
            return res.status(400).json({status: "fail", data:"wrong code"})
        }

        pendingRegistration.delete(number)
        const user = await createUser(savedData.firstname, savedData.lastname, number, savedData.password)

        const token = jwt.sign({id: user.insertId}, process.env.JWT_TOKEN, {expiresIn: "7d"})

        res.status(201).json({status: "success", token: token})
    }catch(err){
        console.log(err);
        res.status(500).json({status:"error"});
    }
})

export {router as authRouter}