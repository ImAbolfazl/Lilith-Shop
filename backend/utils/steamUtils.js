import axios from "axios";
import { createProduct } from "../src/db.js";

export async function addSteamGameToDB(steamId){
    const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=usd`)
    const gameData = response.data[steamId].data
    const gameDesc = gameData.detailed_description.replace(/class="bb_tag"/gi, '').replace(/class="bb_paragraph"/gi, '').replace(/<h2[^>]*>/gi, '<h2 class="description-heading">').replace(/<\/h2>/gi, '</h2>').replace(/<p[^>]*>/gi, '<p class="description-paragraph">').replace(/<\/p>/gi, '</p>').replace(/style="[^"]*"/gi, '').replace(/id="[^"]*"/gi, '');
    if(gameData){
        await createProduct(
            gameData.name,
            'steam',
            gameData.header_image,
            gameData.background,
            gameData.price_overview.initial ?? 0,
            gameData.price_overview.final ?? 0,
            gameData.price_overview.discount_percent ?? 0,
            gameDesc,
            steamId
        )
    }
}