import rateLimit from "express-rate-limit";

const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {status: "fail", data: "تعداد درخواست بیش از حد مجاز است. لطفا بعدا تلاش کنید."}
});

export {authLimit as authLimitMiddleware}