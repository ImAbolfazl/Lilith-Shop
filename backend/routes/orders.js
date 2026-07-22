import express from "express"
import { createOrder, deleteOrderByID, getOrdersByUserID, updateOrderByID } from "../src/db.js"

const router = express.Router()

router.post("/", (req, res) => {
    try{
        const {userId, productId} = req.body

        if(!userId || !productId){return res.status(400).json({status: "fail", data: "please provide the credentials"})}

        createOrder(userId, productId)

        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

router.get("/", (req, res) => {
    try{
        const result = getOrdersByUserID(req.userId)

        res.status(200).json({status: "success", data: result})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

router.put("/", (req, res) => {
    try{
        const {id, quantity} = req.body

        if(!quantity){return res.status(400).json({status: "fail", data: "please provide the credentials"})}

        const result = updateOrderByID(id, quantity)

        res.status(200).json({status: "success", data: result})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

router.delete("/", (req, res) => {
    try{
        const {id} = req.body

        if(!id){return res.status(400).json({status: "fail", data: "please provide the credentials"})}

        deleteOrderByID(id)

        res.json(200).json({status: "success"})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

export {router as ordersRouter}