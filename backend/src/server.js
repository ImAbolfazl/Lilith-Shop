import "../utils/dotenvConfig.js"
import axios from "axios"
import express from "express"
import { productRouter } from "../routes/products.js"
import { updateDatabase } from "../services/databaseUpdate.js"
import cors from "cors"
const app = express()
const PORT = process.env.PORT

app.use(cors({origin: "http://localhost:5173", credentials: true}))
app.use("/api/products", productRouter)


app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);

    updateDatabase().catch(err => console.error("Initial database update failed:", err));

    setInterval(() => {
        updateDatabase().catch(err => console.error("Scheduled database update failed:", err));
    }, 60 * 60 * 1000);
});