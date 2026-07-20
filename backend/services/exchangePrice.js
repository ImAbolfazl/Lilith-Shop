import fs from "fs/promises";
import axios from "axios";
import * as cheerio from "cheerio";

const FILE_PATH = "./prices.json";

export let countryCodes = {};

export async function loadPrices() {
    try {
        const file = await fs.readFile(FILE_PATH, "utf8");
        countryCodes = JSON.parse(file);
    } catch (err) {
        console.error("Failed to load prices:", err);
    }
}


export const exchangeRates = {
    cn: 0,
    in: 0,
    br: 0,
    ar: 0,
    us: 0,
    ua: 0,
    tr: 0,
};

const pages = {
    cn: "https://www.tgju.org/profile/price_cny",
    in: "https://www.tgju.org/profile/price_inr",
    br: "https://www.tgju.org/profile/price_brl",
    ar: "https://www.tgju.org/profile/price_dollar_rl",
    us: "https://www.tgju.org/profile/price_dollar_rl",
    ua: "https://www.tgju.org/profile/price_uah",
    tr: "https://www.tgju.org/profile/price_dollar_rl",
};

export async function updateExchangeRates() {
    try {
        await Promise.all(
            Object.entries(pages).map(async ([code, url]) => {
                const { data } = await axios.get(url);

                const $ = cheerio.load(data);

                const value = $('span[data-col="info.last_trade.PDrCotVal"]').first().text().replace(/,/g, "")

                exchangeRates[code] = Math.floor(Number(value) / 10);
            })
        );

    } catch (err) {
        console.error(err);
    }
}