import axios from "axios";
import express, { json } from "express";
import {
    createProduct, deleteProductById,
    getAllCategories,
    getAllProducts, getDiscountProducts,
    getProductById,
    getProductsByCategory,
    updateProductById
} from "../src/db.js";
import { addSteamGameToDB } from "../utils/steamUtils.js";
import { authMiddleware } from "../middlewares/auth.js";
import { roleMiddleware } from "../middlewares/adminMiddleware.js";
import { upload } from "../middlewares/upload.js";
import { config } from "../utils/fetchSettingsJSON.js";
import { countryCodes, exchangeRates } from "../services/exchangePrice.js";

export const router = express.Router();

export const applyProfit = async (products) => {
    return products.map(product => ({
        ...product,
        price: (typeof product.price === "string"
            ? JSON.parse(product.price)
            : product.price
        ).map(price => ({
            ...price,
            price: Math.floor(
                price.price * (1 + Number(config.profitPercentage) / 100)
            )
        }))
    }));
};

router.get("/category/:category", async (req, res) => {
    try {
        const { category } = req.params;

        let result;

        if (category.toLowerCase() === "all") {
            result = await getAllProducts();
        } else {
            result = await getProductsByCategory(category);
        }

        result = await applyProfit(result);

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

        let result = await getProductById(id);


        if (result.length === 0) {
            return res.status(404).json({
                status: "fail"
            });
        }

        result = await applyProfit(result);

        res.status(200).json({
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

router.get("/product/:id/raw", authMiddleware, roleMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (req.role !== "admin") {
            return res.status(401).json({
                status: "access denied"
            });
        }

        const result = await getProductById(id)

        res.status(200).json({
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
            const { title, category, price, info, steamId, publisher, dlc, currency } = req.body;
            let finalPrice
            if (steamId) {
                await addSteamGameToDB(steamId);
                return res.json({ status: "success" });
            }else{
                if(currency == "Iran"){
                    finalPrice = [{
                        price: price,
                        country: currency,
                        persian: countryCodes[currency].persian
                    }]
                }else{
                    finalPrice = [{
                        price: price * exchangeRates[countryCodes[currency].tag],
                        country: currency,
                        persian: countryCodes[currency].persian
                    }]
                }
            }

            const image = req.files.image
                ? `/uploads/others/${req.files.image[0].filename}`
                : null;

            const banner = req.files.banner
                ? `/uploads/others/${req.files.banner[0].filename}`
                : null;

            await createProduct(
                title,
                category,
                image,
                banner,
                JSON.stringify(finalPrice),
                null,
                info,
                null,
                null,
                null,
                publisher,
                dlc
            );

            res.json({ status: "success" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ status: "error" });
        }
    }
);

router.put("/", authMiddleware, roleMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(401).json({
            status: "access denied"
        });
    }

    try {
        const {
            id,
            title,
            category,
            image,
            banner,
            price,
            discount,
            info,
            recommended,
            minimum,
            publisher,
            dlc
        } = req.body;

        await updateProductById(
            id,
            title,
            category,
            image,
            banner,
            JSON.stringify(price),
            discount,
            info,
            recommended,
            minimum,
            publisher,
            dlc
        );

        res.status(200).json({
            status: "success"
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            status: "error"
        });
    }
});

router.get("/categories", async (req, res) => {
    try {
        const categories = await getAllCategories() || [];

        const result = await Promise.all(
            categories.map(async category => {
                let categoryData = await getProductsByCategory(category);

                categoryData = await applyProfit(categoryData);

                return {
                    name: category,
                    data: categoryData
                };
            })
        );

        res.status(200).json({
            status: "success",
            data: result
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({status: "error"});
    }
});

router.delete("/:id", authMiddleware, roleMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(401).json({
            status: "access denied"
        });
    }

    try{
        const id = Number(req.params.id);

        await deleteProductById(id)

        res.status(200).json({status: "success"})
    }catch(err){
        console.error(err)
        res.status(500).json({status: "error"});
    }
})

router.get("/discounts", async (req, res) => {
    try{
        const result = await getDiscountProducts()

        res.status(200).json({status: "success", data: result})
    }catch(err){
        console.error(err);
        res.status(500).json({status: "error"});
    }
})

export { router as productRouter };