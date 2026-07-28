import express from "express"
import {createOrder, deleteOrderByID, getOrdersByUserID, getProductById, updateOrderByID} from "../src/db.js"
import axios from "axios";
import {applyProfit} from "./products.js";
import { log } from "console";

const router = express.Router()

router.post("/", async (req, res) => {
    try{
        const {userId, productId, quantity, info} = req.body

        if(!userId || !productId){return res.status(400).json({status: "fail", data: "please provide the credentials"})}

        await createOrder(Number(userId), (Number)(productId), Number(quantity), JSON.stringify(info))

        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err)
        return res.status(500).json({status: "fail"})
    }
})

router.get("/", async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const result = await getOrdersByUserID(req.userId, page, limit)

        const finalResult = await Promise.all(
            result.data.map(async (order) => {
                const product = await applyProfit(await getProductById(order.productId))
                let selectedPrice
                for(const sub of product[0].price.subs[order.info.region]){
                    if(sub.name == order.info.name){
                        selectedPrice = sub.price
                    }
                }
                return {
                    ...order,
                    info: {
                        ...order.info,
                        price: selectedPrice,
                        discount: JSON.parse(product[0].discount),
                        realDiscount: product[0].realDiscount
                    }
                }
            })
        );

        res.status(200).json({
            status: "success",
            data: finalResult,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({status: "fail"});
    }
});

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