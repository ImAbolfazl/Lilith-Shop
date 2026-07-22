import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import { watch } from "fs";

const FILE_PATH = "./prices.json";

export let countryCodes = {};

async function reloadPrices() {
    try {
        const data = await fs.readFile(FILE_PATH, "utf8");
        countryCodes = JSON.parse(data);
    } catch (err) {
        console.error("Failed to reload prices:", err);
    }
}

export async function loadPrices() {
    await reloadPrices();
    watch(FILE_PATH, async (eventType) => {
        if (eventType === "change") {
            await reloadPrices();
        }
    });
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