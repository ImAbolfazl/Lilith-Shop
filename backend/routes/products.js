import axios from "axios"
import express from "express"
import { createProduct, getProductById, getProductsByCategory } from "../src/db.js"
import { addSteamGameToDB } from "../utils/steamUtils.js"

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

router.post("/", async (req, res) => {
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

export {router as gamesRouter}