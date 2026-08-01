import express from "express";
import {updateUserById, getAllUsers, deleteUserById} from "../src/db.js";
import { authMiddleware } from "../middlewares/auth.js";
import { roleMiddleware } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.put("/", async (req, res) => {
    try{
        const {firstname, lastname, email, password, number} = req.body;

        if (!firstname || firstname.length > 50){return res.status(400).json({status: "fail", data: "نام اشتباه است"})}
        if (!lastname || lastname.length > 50){return res.status(400).json({status: "fail", data: "نام خانوادگی اشتباه است"})}
        if (!/^09\d{9}$/.test(number)){return res.status(400).json({status: "fail", data: "شماره اشتباه اشت"})}
        if (password.length > 12 || password.length < 6){return res.status(400).json({status: "fail", data: "رمز عبود باید کمتر از 12 حرف و بیشتر از 6 حرف باشد"})}

        const user = await updateUserById(req.userId, firstname, lastname, number, email, password)
        res.status(200).json({status: "success", data: user})
    }catch(err){
        console.log(err)
        res.status(400).send({status: "error"}).end()
    }
})

router.get("/all", authMiddleware, roleMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(401).json({
            status: "access denied"
        });
    }

    try{
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const result = await getAllUsers(page, limit)

        res.status(200).json({
            status: "success",
            data: result.data,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total
            }
        });
    }catch(err){
        console.log(err)
        res.status(500).json({status: "error"});
    }
})

router.delete("/:id", authMiddleware, roleMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(401).json({
            status: "access denied"
        });
    }

    try{
        const id = Number(req.params.id);

        if(id === req.userId){
            return res.status(400).json({status: "fail", data: "نمیتوانید اکانت خودتان را حذف کنید"})
        }

        await deleteUserById(id)

        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err)
        res.status(500).json({status: "error"});
    }
})

export {router as usersRouter}