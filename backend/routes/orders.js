import express from "express"
import {createOrder, deleteOrderByID, getOrdersByUserID, getProductById, updateOrderByID} from "../src/db.js"
import axios from "axios";
import {applyProfit} from "./products.js";

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
        const finalResult = []

        for(const order of result){
            const region = order.info.region
            const product = await applyProfit(await getProductById(order.productId))
            for(const price of product[0].price){
                if(price.country == region){
                    finalResult.push({...order, info: {...order.info, price: price.price}})
                }
            }
        }

        res.status(200).json({status: "success", data: finalResult})
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

        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

export {router as ordersRouter}