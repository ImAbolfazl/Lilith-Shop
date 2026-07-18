import "../utils/dotenvConfig.js"
import axios from "axios"
import express from "express"
import { gamesRouter } from "../routes/games.js"
import { updateDatabase } from "../services/databaseUpdate.js"
const app = express()
const PORT = process.env.PORT

app.use("/api/games", gamesRouter)
await updateDatabase()

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
})