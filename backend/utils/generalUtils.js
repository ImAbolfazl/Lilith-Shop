import axios from "axios"

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