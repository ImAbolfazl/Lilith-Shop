import "../utils/dotenvConfig.js"
import axios from "axios"
import express from "express"
import { gamesRouter } from "../routes/products.js"
import { updateDatabase } from "../services/databaseUpdate.js"
const app = express()
const PORT = process.env.PORT

app.use("/api/games", gamesRouter)


await updateDatabase()
setInterval(async () => {
    await updateDatabase()
}, 1 * 60 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})