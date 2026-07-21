import axios from "axios";
import { createProduct, updateGamePrice } from "../src/db.js";
import { countryCodes, exchangeRates } from "../services/exchangePrice.js";
import { HTMLTranslator } from "./htmlTranslator.js";
import { downloadImage } from "./generalUtils.js";

export async function addSteamGameToDB(steamId) {
    const response = await axios.get(
        `https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=us`
    );

    const gameData = response.data[steamId].data;

    if (!gameData) {
        console.log("Game not found.");
        return;
    }

    let price = [];
    let discount = 0;
    let hasDLC = "ندارد";

    if (gameData.is_free) {
        if (gameData.dlc) {
            for (const country in countryCodes) {
                const response = await axios.get(
                    `https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=${countryCodes[country].tag}`
                );

                price.push({
                    country,
                    persian: countryCodes[country].persian,
                    price: Math.round(
                        Number(
                            (
                                response.data[steamId].data.package_groups[0].subs[0]
                                    .price_in_cents_with_discount / 100
                            ).toFixed(2)
                        ) * exchangeRates[countryCodes[country].tag]
                    )
                });
            }
        } else {
            console.log("Game is free or has no purchasable package.");
            return;
        }
    } else {
        for (const country in countryCodes) {
            const response = await axios.get(
                `https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=${countryCodes[country].tag}`
            );

            price.push({
                country,
                persian: countryCodes[country].persian,
                price: Math.round(
                    Number(
                        (
                            response.data[steamId].data.price_overview.initial / 100
                        ).toFixed(2)
                    ) * exchangeRates[countryCodes[country].tag]
                )
            });

            if (gameData.price_overview.discount_percent) {
                discount = gameData.price_overview.discount_percent;
            }
        }
    }

    if (gameData.packages) {
        hasDLC = "دارد";
    }

    const gameDesc = HTMLTranslator(
        gameData.about_the_game,
        "description"
    );

    const minimumSys = HTMLTranslator(
        gameData.pc_requirements?.minimum ?? "",
        "requirements"
    );

    const recommendedSys = HTMLTranslator(
        gameData.pc_requirements?.recommended ?? "",
        "requirements"
    );

    price.sort((a, b) => a.price - b.price);
    const headerFile = `./public/uploads/headers/${steamId}.jpg`;
    const backgroundFile = `./public/uploads/backgrounds/${steamId}.jpg`;
    await downloadImage(gameData.header_image, headerFile);
    await downloadImage(gameData.background_raw, backgroundFile);
    const headerPath = `/uploads/headers/${steamId}.jpg`;
    const backgroundPath = `/uploads/backgrounds/${steamId}.jpg`;

    await createProduct(
        `خرید بازی ${gameData.name} استیم`,
        "Steam",
        headerPath,
        backgroundPath,
        JSON.stringify(price),
        discount,
        gameDesc,
        steamId,
        recommendedSys,
        minimumSys,
        gameData.publishers[0],
        hasDLC
    );
}

export async function updateGmaePriceInDB(steamId) {
    const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=us`);
    const gameData = response.data[steamId].data;
    let price = []
    let discount = 0
    if(gameData.is_free){
        if(gameData.dlc){
            for (const country in countryCodes) {
                const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=${countryCodes[country].tag}`)
                
                price = [...price, {country: [country], persian: countryCodes[country].persian, price: Math.round(Number((response.data[steamId].data.package_groups[0].subs[0].price_in_cents_with_discount / 100).toFixed(2)) * exchangeRates[countryCodes[country].tag])}]
            }
        }else{
            console.log("game is either free or doesnt havea price in the steam api");
            return
        }
    }else{
        for (const country in countryCodes) {
            const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=${countryCodes[country].tag}`)
            
            price = [...price, {country: [country], persian: countryCodes[country].persian, price: Math.round(Number((response.data[steamId].data.price_overview.initial / 100).toFixed(2)) * exchangeRates[countryCodes[country].tag])}]
            if(gameData.price_overview.discount_percent){
                discount = gameData.price_overview.discount_percent
            }
        }
    }
    price.sort((a, b) => a.price - b.price);
    updateGamePrice(JSON.stringify(price), discount, steamId)
}