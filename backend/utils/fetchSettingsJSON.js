import fs from "fs";
import path from "path";

const configPath = path.resolve("./config.json");

let config = JSON.parse(
    fs.readFileSync(configPath, "utf8")
);

fs.watchFile(configPath, () => {
    try {
        config = JSON.parse(
            fs.readFileSync(configPath, "utf8")
        );
        console.log("Config reloaded");
    } catch (err) {
        console.error(err);
    }
});

export { config };