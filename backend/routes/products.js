import axios from "axios"
import express from "express"
import { createProduct, getAllCategories, getProductById, getProductsByCategory, updateProductById } from "../src/db.js"
import { addSteamGameToDB } from "../utils/steamUtils.js"
import { authMiddleware } from "../middlewares/auth.js"
import { roleMiddleware } from "../middlewares/role.js"

export const router = express.Router()

router.get("/category/:category", async (req, res) => {
    try{
        const {category} = req.params
        const result = await getProductsByCategory(category)

        if(result.length == 0){return res.status(400).json({status: "fail"})}

        res.status(200).json({
            status: "success",
            data: result
        })
    }catch(err){
        console.log(err);
        
        return res.status(500).json({status: "error"})
    }
})

router.get("/product/:id", async (req, res) => {
    try{
        const {id} = req.params

        const reuslt = getProductById(id)
        
        if(result.length > 0){return res.status(400).json({status: "fail"})}
        
        res.status(200).json({
            status: "success",
            data: result
        })
    }catch(err){
        console.log(err);
        
        return res.status(500).json({status: "error"})
    }
})

router.post("/",authMiddleware, roleMiddleware, async (req, res) => {
    if(req.role != "admin"){return res.status(401).json({status: "access denied"})}

    try{
        const {title, category, image, banner, price, info, steamId} = req.body

        if(steamId){
            addSteamGameToDB(steamId)

            return res.status(200).json({status: "success"})
        }

        createProduct(title, category, image, banner, price, null, null, info, null)

        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err);
        
        return res.status(500).json({status: "error"})
    }
})

router.put("/", authMiddleware, roleMiddleware, async (req, res) => {
    if(req.role != "admin"){return res.status(401).json({status: "access denied"})}

    try{
        const {id, title, category, image, banner, price, discountPrice, discount, info} = req.body

        if(!title || !category || !image || !banner || !price || !discountPrice || !discount || !info){}

        updateProductById(id, title, category, image, banner, price, discountPrice, discount, info)

        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err);
        
        return res.status(500).json({status: "error"})
    }
})

router.get("/categories", async (req, res) => {
    try {
        const categories = await getAllCategories() || [];
        const result = await Promise.all(categories.map(async (category) => {
            const categoryData = await getProductsByCategory(category);
            return {
                name: category,
                data: categoryData
        }}))

        res.status(200).json({
            status: "success",
            data: result
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: "error" });
    }
});

export {router as productRouter}