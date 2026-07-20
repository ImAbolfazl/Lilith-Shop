import axios from "axios"
import express from "express"
import { createProduct, getAllCategories, getAllProducts, getProductById, getProductsByCategory, updateProductById } from "../src/db.js"
import { addSteamGameToDB } from "../utils/steamUtils.js"
import { authMiddleware } from "../middlewares/auth.js"
import { roleMiddleware } from "../middlewares/role.js"
import { upload } from "../middlewares/upload.js";
import { config } from "../utils/fetchSettingsJSON.js"

export const router = express.Router()

router.get("/category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        let result;
        if (category.toLowerCase() === "all") {
            result = await getAllProducts();
        } else {
            result = await getProductsByCategory(category);
        }
        result = result.map((product) => ({
            ...product,
            price: product.price.map((price) => ({
                ...price,
                price: Math.floor(
                    price.price * (1 + Number(config.profitPercentage) / 100)
                )
            }))
        }));
        if (result.length === 0) {
            return res.status(400).json({
                status: "fail"
            });
        }
        res.status(200).json({
            status: "success",
            data: result
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            status: "error"
        });
    }
});

router.get("/product/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await getProductById(id);
        if (result.length === 0) {
            return res.status(404).json({
                status: "fail"
            });
        }
        result[0].price = result[0].price.map((item) => ({
            ...item,
            price: Math.floor(item.price * (1 + Number(config.profitPercentage) / 100))
        }));
        return res.status(200).json({
            status: "success",
            data: result[0]
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error"
        });
    }
});


router.post(
    "/",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "banner", maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { title, category, price, currency, info, steamId } = req.body;

            if (steamId) {
                await addSteamGameToDB(steamId);
                return res.json({ status: "success" });
            }
            
            const image = req.files.image ? `/uploads/${req.files.image[0].filename}` : null;
            const banner = req.files.banner ? `/uploads/${req.files.banner[0].filename}` : null;

            await createProduct(title, category, image, banner, price, null, info, null, null, null);

            res.json({ status: "success" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: "error" });
        }
    }
);

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
            let categoryData = await getProductsByCategory(category);
            return {
                name: category,
                data: categoryData = categoryData.map((product) => ({
                    ...product,
                    price: product.price.map((price) => ({
                        ...price,
                        price: Math.floor(
                            price.price * (1 + Number(config.profitPercentage) / 100)
                        )
                    }))
                }))
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