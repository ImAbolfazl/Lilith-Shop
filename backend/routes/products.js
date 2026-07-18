import axios from "axios"
import express from "express"
import { createProduct, getAllCategories, getProductById, getProductsByCategory, updateProductById } from "../src/db.js"
import { addSteamGameToDB } from "../utils/steamUtils.js"
import { authMiddleware } from "../middlewares/auth.js"
import { roleMiddleware } from "../middlewares/role.js"

export const router = express.Router()

router.get("/:category", async (req, res) => {
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

router.get("/:id", async (req, res) => {
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
        const {title, category, image, banner, price, info, steamId}

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
        const {id, title, category, image, banner, price, discountedPrice, discount, info} = req.body

        if(!title || !category || !image || !banner || !price || !discountedPrice || !discount || !info){}

        updateProductById(id, title, category, image, banner, price, discountedPrice, discount, info)

        res.status(200).json({status: "success"})
    }catch(err){
        console.log(err);
        
        return res.status(500).json({status: "error"})
    }
})

router.get("/categories", async (req, res) => {
    try{
        const result = await getAllCategories()

        res.status(200).json({
            status: "success",
            data: result
        })
    }catch(err){
        console.log(err);
        
        return res.status(500).json({status: "error"})
    }
})

export {router as gamesRouter}