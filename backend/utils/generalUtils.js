import fs from "fs";
import path from "path";
import axios from "axios";
import { exchangeRates } from "../services/exchangePrice.js";

export async function sendSMSValidation(number, code) {
    const response = await axios({
        method: "post",
        url: "https://api.sms.ir/v1/send/verify",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain',
            'x-api-key': process.env.SMS_API_KEY
        },
        data:{
            "mobile": number,
            "templateId": process.env.SMS_TEMPLATE_ID,
            "parameters": [
            {
                "name": "VERIFICATIONCODE",
                "value": code.toString()
            }
            ]
        }
    })

    return response
}

export async function downloadImage(url, outputPath) {
    try {
        await fs.promises.access(outputPath, fs.constants.F_OK);
        return outputPath;
    } catch {}

    const response = await axios({
        url,
        method: "GET",
        responseType: "stream"
    });

    await fs.promises.mkdir(path.dirname(outputPath), {
        recursive: true
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(outputPath);

        response.data.pipe(writer);

        writer.on("finish", () => resolve(outputPath));
        writer.on("error", reject);
    });
}