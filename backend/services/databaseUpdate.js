import axios from "axios"
import { gamesDataSet } from "./gameIdDataset.js"
import { createProduct, getProductBySteamId, updateGamePrice } from "../src/db.js"
import { addSteamGameToDB } from "../utils/steamUtils.js";

export async function updateDatabase() {
    for (let i = 0; i < gamesDataSet.length; i++) {
        const steamId = gamesDataSet[i];
        try {
            const game = await getProductBySteamId(steamId)
            if(game.length > 0){
                const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=us`);
                const gameData = response.data[steamId];
                if (gameData?.success && gameData.data?.price_overview) {
                    const priceInfo = gameData.data.price_overview;
                    await updateGamePrice(priceInfo.final, priceInfo.discount_percent, steamId);
                }
            }else{
                await addSteamGameToDB(steamId)
            }
        } catch (err) {
            console.error(err);
        }
        console.log(`updated/added ${steamId}`)
        await new Promise(resolve => setTimeout(resolve, 1200));
    }
}