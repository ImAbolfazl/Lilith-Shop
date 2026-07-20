import axios from "axios"
import { gamesDataSet } from "./gameIdDataset.js"
import { createProduct, getAllProducts, getProductBySteamId, updateGamePrice } from "../src/db.js"
import { addSteamGameToDB, updateGmaePriceInDB } from "../utils/steamUtils.js";
import fs from "fs/promises";

const config = JSON.parse(
  await fs.readFile("./config.json", "utf8")
);

export async function updateDatabase() {
    for (let i = 0; i < gamesDataSet.length; i++) {
        const steamId = gamesDataSet[i];
        try {
            const game = await getProductBySteamId(steamId)
            if(game.length > 0){
                await updateGmaePriceInDB(steamId)
            }else{
                await addSteamGameToDB(steamId)
            }
        } catch (err) {
            console.error(err);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log("done update/adding steam games!")
}