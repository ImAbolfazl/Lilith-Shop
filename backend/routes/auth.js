import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { createUser, getUserByNumber } from "../src/db.js"
import { sendSMSValidation } from "../utils/generalUtils.js"

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
        const {firstname, lastname, email, number, password} = req.body
        try{
            if (!firstname || firstname.length > 50){return res.status(400).json({status: "fail", data: "نام اشتباه است"})}
            if (!lastname || lastname.length > 50){return res.status(400).json({status: "fail", data: "نام خانوادگی اشتباه است"})}
            if (!/^09\d{9}$/.test(number)){return res.status(400).json({status: "fail", data: "شماره اشتباه اشت"})}
            if (password.length > 12 || password.length < 6){return res.status(400).json({status: "fail", data: "رمز عبود باید کمتر از 12 حرف و بیشتر از 6 حرف باشد"})}

            const user = await getUserByNumber(number)
            if(user){return res.status(400).json({status: "fail", data: "کاربر وجود دارد"})}

            if(pendingRegistration.get(number)){return res.status(409).json({status: "fail", data: "لطفا قبل از درخواست جدید صبر کنید"})}

            const verificationCode = crypto.randomInt(10000, 99999)
            const response = await sendSMSValidation(number, verificationCode)
            if(response.data.message != "موفق"){return res.status(500).json({status: "error", data: "در ارسال پیامک مشکلی پیش امده"})}

            const encryptedPassword = await bcrypt.hash(password, 10)
            pendingRegistration.set(number, {
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: encryptedPassword,
                verificationCode: verificationCode,
                expiresAt: Date.now() + 5 * 60 * 1000,
                attempts: 0
            })
            console.log(verificationCode);
            res.status(200).json({status: "success", data: "کد ارسال شد"})

        }catch(err){
            console.log(err);
            return res.status(400).json({status: "error"})
        }

    }catch(err){
        console.log(err);
        return res.status(500).json({status: "error"})
    }
})

router.post("/login", async (req, res) => {
    try{
        const {number, password} = req.body
        try{
            if (!/^09\d{9}$/.test(number)){return res.status(400).json({status: "fail", data: "شماره اشتباه اشت"})}
            if (password.length > 12 || password.length < 6){return res.status(400).json({status: "fail", data: "رمز عبود باید کمتر از 12 حرف و بیشتر از 6 حرف باشد"})}

            const user = await getUserByNumber(number)
            if(!user){return res.status(404).json({status: "fail", data: "کاربر وجود ندارد"})}

            const isPasswordValid = await bcrypt.compare(password, user.password)

            if(!isPasswordValid){return res.status(400).json({status: "fail", data:"شماره یا رمز نادرست است"})}

            const token = jwt.sign({id: user.id}, process.env.JWT_TOKEN, {expiresIn: "7d"})

            pendingLogin.delete(number);
            res.status(200).json({status: "success", token: token})
        }catch(err){
            console.log(err);
            return res.status(500).json({status:"error"});
        }
        
    }catch(err){
        console.log(err);
        return res.status(500).json({status: "error"})
    }
})

router.post("/loginWithNumber", async (req, res) => {
    try{
        const {number} = req.body
        try{
            if (!/^09\d{9}$/.test(number)){return res.status(400).json({status: "fail", data: "شماره اشتباه اشت"})}

            const user = await getUserByNumber(number)
            if(!user){return res.status(400).json({status: "fail", data: "کاربر وجود ندارد"})}

            if(pendingLogin.get(number)){return res.status(409).json({status: "fail", data: "لطفا قبل از درخواست جدید صبر کنید"})}
            const verificationCode = crypto.randomInt(10000, 99999)
            const response = await sendSMSValidation(number, verificationCode)
            if(response.data.message != "موفق"){return res.status(500).json({status: "error", data: "در ارسال پیامک مشکلی پیش امده"})}

            pendingLogin.set(number, {
                verificationCode: verificationCode,
                expiresAt: Date.now() + 5 * 60 * 1000,
                attempts: 0
            })
            console.log(verificationCode);
            res.status(200).json({status: "success", data: "کد ارسال شد"})

        }catch(err){
            console.log(err);
            return res.status(400).json({status: "error"})
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({status: "error"})
    }
})

router.post("/verifyLogin", async (req, res) => {
    try{
        const {number, code} = req.body
        const savedData = pendingLogin.get(number)
        
        if (!savedData) {return res.status(400).json({status: "fail", data: "درخواستی ارسال نشده"})}

        if(Date.now() > savedData.expiresAt){
            pendingLogin.delete(number)
            return res.status(400).json({status: "fail", data: "زمان به پایان رسیده"})
        }

        if(savedData.attempts >= 5){
            pendingLogin.delete(number)
            return res.status(401).json({status: "error", data: "تعداد تلاش ها بیش تر از حد مجاز"})
        }

        if(String(code) != String(savedData.verificationCode)){
            savedData.attempts++
            pendingLogin.set(number, savedData)
            return res.status(400).json({status: "fail", data:"کد اشتباه است"})
        }


        pendingLogin.delete(number)
        const user = await getUserByNumber(number)

        const token = jwt.sign({id: user.id}, process.env.JWT_TOKEN, {expiresIn: "7d"})

        res.status(201).json({status: "success", token: token})
    }catch(err){
        console.log(err);
        return res.status(500).json({status:"error"});
    }
})

router.post("/verifyRegister", async (req, res) => {
    try{
        const {number, code} = req.body
        const savedData = pendingRegistration.get(number)

        if (!savedData) {return res.status(400).json({status: "fail", data: "درخواستی ارسال نشده"})}

        if(Date.now() > savedData.expiresAt){
            pendingRegistration.delete(number)
            return res.status(400).json({status: "fail", data: "زمان به پایان رسیده"})
        }

        if(savedData.attempts >= 5){
            pendingRegistration.delete(number)
            return res.status(401).json({status: "error", data: "تعداد تلاش ها بیش تر از حد مجاز"})
        }

        if(String(code) != String(savedData.verificationCode)){
            savedData.attempts++
            pendingRegistration.set(number, savedData)
            return res.status(400).json({status: "fail", data:"کد اشتباه است"})
        }

        pendingRegistration.delete(number)
        const user = await createUser(savedData.firstname, savedData.lastname, savedData.email, number, savedData.password)

        const token = jwt.sign({id: user.insertId}, process.env.JWT_TOKEN, {expiresIn: "7d"})

        res.status(201).json({status: "success", token: token})
    }catch(err){
        console.log(err);
        return res.status(500).json({status:"error"});
    }
})

export {router as authRouter}