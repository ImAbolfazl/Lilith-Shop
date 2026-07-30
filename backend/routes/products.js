import axios from "axios";
import express, { json } from "express";
import {
    createProduct, deleteProductById,
    getAllCategories,
    getAllProducts, getDiscountProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    updateProductById
} from "../src/db.js";
import { addSteamGameToDB } from "../utils/steamUtils.js";
import { authMiddleware } from "../middlewares/auth.js";
import { roleMiddleware } from "../middlewares/adminMiddleware.js";
import { upload } from "../middlewares/upload.js";
import { config } from "../utils/fetchSettingsJSON.js";
import { countryCodes, exchangeRates } from "../services/exchangePrice.js";

export const router = express.Router();

const getExchangeRate = (tag, isSteamCategory) => {
    if (!tag) return 1;

    const lower = tag.toLowerCase();

    if (isSteamCategory && (lower === "tr" || lower === "ar")) {
        return exchangeRates.us || 1;
    }

    return exchangeRates[lower] || 1;
};

export const applyProfit = async (products) => {
    return products.map(product => {
        const parsedPrice =
            typeof product.price === "string"
                ? JSON.parse(product.price)
                : product.price;

        const profitMultiplier = 1 + Number(config.profitPercentage) / 100;

        const isSteamCategory = product.category === "Steam";

        const exchangedSubs = parsedPrice.subs
            ? Object.fromEntries(
                Object.entries(parsedPrice.subs).map(([country, items]) => [
                    country,
                    items.map(item => ({
                        ...item,
                        price: Math.floor(
                            item.price * getExchangeRate(item.tag, isSteamCategory) * profitMultiplier
                        )
                    }))
                ])
            )
            : {};

        const initialTag = parsedPrice.initialTag
            || Object.values(parsedPrice.subs || {})[0]?.[0]?.tag;

        const initialRate = getExchangeRate(initialTag, isSteamCategory);

        return {
            ...product,
            price: {
                ...parsedPrice,

                initial: parsedPrice.initial
                    ? Math.floor(parsedPrice.initial * initialRate * profitMultiplier)
                    : parsedPrice.initial,

                final: parsedPrice.final
                    ? Math.floor(parsedPrice.final * profitMultiplier)
                    : parsedPrice.final,

                subs: exchangedSubs
            }
        };
    });
};

router.get("/category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        let result;

        if (category.toLowerCase() === "all") {
            result = await getAllProducts(page, limit);
        } else {
            result = await getProductsByCategory(category, page, limit);
        }

        result.data = await applyProfit(result.data);

        if (result.data.length === 0) {
            return res.status(400).json({
                status: "fail"
            });
        }

        res.status(200).json({
            status: "success",
            data: result.data,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total
            }
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
            const { title, category, price, info, steamId, publisher, dlc, currency, discount } = req.body;
            let finalPrice
            if (steamId) {
                await addSteamGameToDB(steamId);
                return res.json({ status: "success" });
            }else{
                if(currency == "Iran"){
                    finalPrice = {
                        "subs": {
                            [countryCodes[currency].persian]: [{
                                    "tag": countryCodes[currency].tag.toUpperCase(),
                                    "name": title,
                                    "price": price
                                }]
                        },
                        "initial": price
                    }
                }else{
                    finalPrice = {
                        "subs": {
                            [countryCodes[currency].persian]: [{
                                "tag": countryCodes[currency].tag.toUpperCase(),
                                "name": title,
                                "price": price
                            }]
                        },
                        "initial": price,
                        "initialTag": countryCodes[currency].tag.toUpperCase()
                    }
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
                discount,
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

router.put("/:id", authMiddleware, roleMiddleware, async (req, res) => {
    if (req.role !== "admin") {
        return res.status(401).json({
            status: "access denied"
        });
    }

    const id = req.params.id
    try {
        const {
            title,
            category,
            price,
            discount,
            info,
            recommended,
            minimum,
            publisher,
            dlc
        } = req.body;

        await updateProductById(
            Number(id),
            title,
            category,
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
                let categoryData = await getProductsByCategory(category, 1, 20);

                categoryData.data = await applyProfit(categoryData.data);

                return {
                    name: category,
                    data: categoryData.data,
                    pagination: {
                        page: categoryData.page,
                        totalPages: categoryData.totalPages,
                        total: categoryData.total
                    }
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
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

        const result = await getDiscountProducts(page, limit)
        result.data = await applyProfit(result.data);

        res.status(200).json({
            status: "success",
            data: result.data,
            pagination: {
                page: result.page,
                totalPages: result.totalPages,
                total: result.total
            }
        })
    }catch(err){
        console.error(err);
        res.status(500).json({status: "error"});
    }
})

router.get("/search", async (req, res) => {
    try{
        const q = (req.query.q || "").trim();

        if (q.length < 2) {
            return res.status(200).json({ status: "success", data: [] });
        }

        const result = await searchProducts(q, 20);
        const data = await applyProfit(result);

        res.status(200).json({ status: "success", data });
    }catch(err){
        console.error(err);
        res.status(500).json({status: "error"});
    }
})

export { router as productRouter };