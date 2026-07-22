import express from "express"
import { createOrder, deleteOrderByID, getOrdersByUserID, updateOrderByID } from "../src/db.js"

const router = express.Router()

router.post("/", async (req, res) => {
    try{
        const {userId, productId, quantity, info} = req.body

        if(!userId || !productId){return res.status(400).json({status: "fail", data: "please provide the credentials"})}

        await createOrder(userId, productId, quantity, JSON.stringify(info))

        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

router.get("/", async (req, res) => {
    try{
        const result = await getOrdersByUserID(req.userId)

        res.status(200).json({status: "success", data: result})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

router.put("/", async (req, res) => {
    try{
        const {id, quantity, info} = req.body

        if(!quantity || !info){return res.status(400).json({status: "fail", data: "please provide the credentials"})}

        const result = await updateOrderByID(id, quantity, info)

        res.status(200).json({status: "success", data: result})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

router.delete("/", async (req, res) => {
    try{
        const {id} = req.body

        if(!id){return res.status(400).json({status: "fail", data: "please provide the credentials"})}

        await deleteOrderByID(id)

        res.json(200).json({status: "success"})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

export {router as ordersRouter}