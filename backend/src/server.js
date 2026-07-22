import "../utils/dotenvConfig.js"
import axios from "axios"
import express from "express"
import { productRouter } from "../routes/products.js"
import { updateDatabase } from "../services/databaseUpdate.js"
import cors from "cors"
import { connectDatabase } from "./db.js"
import { countryCodes, loadPrices, updateExchangeRates } from "../services/exchangePrice.js"
import { authRouter } from "../routes/auth.js"
import { ordersLimitMiddleware } from "../middlewares/rateLimit.js"
import { authMiddleware } from "../middlewares/auth.js"
import { ordersRouter } from "../routes/orders.js"
const app = express()
const PORT = process.env.PORT

app.use(cors({origin: "*", credentials: true}))
app.use(express.json())
app.use("/uploads", express.static("public/uploads"))
app.use("/api/auth", authRouter)
app.use("/api/products", productRouter)
app.use("/api/orders", ordersLimitMiddleware, authMiddleware, ordersRouter)


app.listen(PORT, async () => {
    await connectDatabase()

    console.log(`server running on port ${PORT}`);

    await updateExchangeRates();
    setInterval(updateExchangeRates, 60 * 1000);

    await loadPrices();

    await updateDatabase()
    setInterval(await updateDatabase, 10 * 60 * 60 * 1000);
});