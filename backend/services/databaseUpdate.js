import { gamesDataSet } from "./gameIdDataset.js";
import { getProductBySteamId } from "../src/db.js";
import { addSteamGameToDB, updateGmaePriceInDB } from "../utils/steamUtils.js";

export async function updateDatabase() {
    for (let i = 0; i < gamesDataSet.length; i++) {
        const steamId = String(gamesDataSet[i]);
        try {
            console.log(`Processing steamId: ${steamId}`);
            const existingGame = await getProductBySteamId(steamId);            
            if (existingGame.length > 0) {
                console.log(`Updating existing game with steamId: ${steamId}`);
                await updateGmaePriceInDB(steamId);
            } else {
                console.log(`Adding new game with steamId: ${steamId}`);
                await addSteamGameToDB(steamId);
            }
        } catch (err) {
            console.error(`Error processing steamId ${steamId}:`, err);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log("Finished updating/adding steam games!");
}