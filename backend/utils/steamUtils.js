import axios from "axios";
import { createProduct } from "../src/db.js";

export async function addSteamGameToDB(steamId){
    const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=usd`)
    const gameData = response.data[steamId].data
    let initialPrice = 0
    let finalPrice = 0
    let discountPrice = 0
    if(gameData.is_free){
        if(gameData.dlc){
            initialPrice = gameData.package_groups[0].subs[0].price_in_cents_with_discount
            finalPrice = gameData.package_groups[0].subs[0].price_in_cents_with_discount
        }else{
            console.log("game is either free or doesnt havea price in the steam api");
            return
        }
    }else{
        initialPrice = gameData.price_overview.initial
        finalPrice = gameData.price_overview.final
        discountPrice = gameData.price_overview.discount_percent
    }
    const gameDesc = gameData.detailed_description.replace(/class="bb_tag"/gi, '').replace(/class="bb_paragraph"/gi, '').replace(/<h2[^>]*>/gi, '<h2 class="description-heading">').replace(/<\/h2>/gi, '</h2>').replace(/<p[^>]*>/gi, '<p class="description-paragraph">').replace(/<\/p>/gi, '</p>').replace(/style="[^"]*"/gi, '').replace(/id="[^"]*"/gi, '');
    if(gameData){
        await createProduct(
            gameData.name,
            'Steam',
            gameData.header_image,
            gameData.background,
            initialPrice,
            "USA",
            finalPrice,
            discountPrice,
            gameDesc,
            steamId
        )
    }
}