import "../utils/dotenvConfig.js"
import axios from "axios"
import express from "express"
import { productRouter } from "../routes/products.js"
import { updateDatabase } from "../services/databaseUpdate.js"
import cors from "cors"
import { connectDatabase } from "./db.js"
import { countryCodes, loadPrices, updateExchangeRates } from "../services/exchangePrice.js"
const app = express()
const PORT = process.env.PORT

app.use(cors({origin: "http://localhost:5173", credentials: true}))
app.use("/uploads", express.static("public/uploads"))
app.use("/api/products", productRouter)


app.listen(PORT, async () => {
    await connectDatabase()

    console.log(`server running on port ${PORT}`);

    await updateExchangeRates();
    setInterval(updateExchangeRates, 60 * 1000);

    await loadPrices();
    setInterval(await loadPrices, 5000);

    await updateDatabase()
    setInterval(await updateDatabase, 10 * 60 * 60 * 1000);
});