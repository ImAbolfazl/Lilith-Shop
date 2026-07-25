import axios from "axios";
import { createProduct, updateGamePrice } from "../src/db.js";
import { countryCodes, exchangeRates } from "../services/exchangePrice.js";
import { HTMLTranslator } from "./htmlTranslator.js";
import { downloadImage } from "./generalUtils.js";

export async function addSteamGameToDB(steamId) {
    const steamExchangeRates = {...exchangeRates, tr: exchangeRates.us, ar: exchangeRates.us};
    const response = await axios.get(
        `https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=us`,{
            timeout: 10000
        });

    const gameData = response.data[steamId].data;

    if (!gameData) {
        console.log("Game not found.");
        return;
    }

    let price = {
        subs: {}
    }
    let discount = 0;
    for (const country in countryCodes) {
        if(country != "Iran") {
            const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=${countryCodes[country].tag}`);
            let pushObject = []
            const packageGroups = response.data[steamId].data.package_groups
            for(const packageGroup of packageGroups) {
                for(const sub of packageGroup.subs) {
                    const name = sub.option_text.slice(0, sub.option_text.lastIndexOf("-")).trim();
                    pushObject = [
                        ...pushObject,
                        {
                            name: name,
                            price: Math.floor((sub.price_in_cents_with_discount / 100) * steamExchangeRates[countryCodes[country].tag])
                        }
                    ]
                }
            }
            price.subs[countryCodes[country].persian] = pushObject;
            await new Promise(r => setTimeout(r, 700));
        }
    }

    const sortedSubs = Object.fromEntries(
        Object.entries(price.subs).sort(
            ([, countryA], [, countryB]) =>
                countryA[0].price - countryB[0].price
        )
    );

    const cheapest = sortedSubs[Object.keys(sortedSubs)[0]][0].price

    if(gameData.price_overview){
        price = {
            subs: sortedSubs,
            initial: cheapest === 0 ? cheapest : Math.floor(cheapest / (1 - gameData.price_overview.discount_percent / 100)),
            final: cheapest,
            discount: gameData.price_overview.discount_percent
        };
        discount = gameData.price_overview.discount_percent
    }else{
        price = {
            subs: sortedSubs,
            initial: cheapest === 0 ? cheapest : Math.floor(gameData.package_groups[0].subs[0].percent_savings / (1 - 0 / 100)),
            final: cheapest,
            discount: gameData.package_groups[0].subs[0].percent_savings
        };
        discount = gameData.package_groups[0].subs[0].percent_savings
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


    let hasDLC = gameData.dlc ? "دارد" : "ندارد"
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
    let steamExchangeRates = {...exchangeRates, tr: exchangeRates.us, ar: exchangeRates.us};
    let gameData
    let price = {
        subs: {}
    }
    let discount = 0;
    for (const country in countryCodes) {
        if(country != "Iran") {
            const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${steamId}&cc=${countryCodes[country].tag}`);
            let pushObject = []
            const packageGroups = response.data[steamId].data.package_groups
            for(const packageGroup of packageGroups) {
                for(const sub of packageGroup.subs) {
                    const name = sub.option_text.slice(0, sub.option_text.lastIndexOf("-")).trim();
                    pushObject = [
                        ...pushObject,
                        {
                            name: name,
                            price: Math.floor((sub.price_in_cents_with_discount / 100) * steamExchangeRates[countryCodes[country].tag])
                        }
                    ]
                }
            }
            price.subs[countryCodes[country].persian] = pushObject;
            gameData = response.data[steamId].data;
            await new Promise(r => setTimeout(r, 700));
        }
    }

    const sortedSubs = Object.fromEntries(
        Object.entries(price.subs).sort(
            ([, countryA], [, countryB]) =>
                countryA[0].price - countryB[0].price
        )
    );

    const cheapest = sortedSubs[Object.keys(sortedSubs)[0]][0].price

    if(gameData.price_overview){
        price = {
            subs: sortedSubs,
            initial: cheapest === 0 ? cheapest : Math.floor(cheapest / (1 - gameData.price_overview.discount_percent / 100)),
        };
        discount = gameData.price_overview.discount_percent
    }else{
        price = {
            subs: sortedSubs,
            initial: cheapest === 0 ? cheapest : Math.floor(gameData.package_groups[0].subs[0].percent_savings / (1 - 0 / 100)),
        };
        discount = gameData.package_groups[0].subs[0].percent_savings
    }

    updateGamePrice(JSON.stringify(price), discount, steamId)
}