import mysql from "mysql2"

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise()

export async function connectDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log("connected to database");
        connection.release();
    } catch (err) {
        console.error(err);
    }
}

export async function createUser(firstname, lastname, phone, password){
    const [result] = await pool.query(
        "INSERT INTO users (firstname, lastname, phone, password) VALUES (?, ?, ?, ?)",
        [firstname, lastname, phone, password]
    )
    return result
}

export async function getUserById(id) {
    const [result] = await pool.query("SELECT * FROM users WHERE id = ?", [id])
    return result[0]
}

export async function getUserByNumber(number) {
    const [result] = await pool.query("SELECT * FROM users WHERE phone = ?", [number])
    return result[0]
}

export async function getProductsByCategory(category) {
    const [result] = await pool.query("SELECT * FROM products WHERE category = ?", [category])
    return result
}

export async function getAllProducts() {
    const [result] = await pool.query("SELECT * FROM products ORDER BY id DESC")
    return result
}

export async function createProduct(title, category, image, banner, price, discount, info, steamId, recommended, minimum, publisher, dlc) {
    let finalPrice = price
    if(!steamId){
        finalPrice = [
            {country: "Iran", persian: "ایران", price: price}
        ]
    }
    const [result] = await pool.query(
        "INSERT INTO products (title, category, image, banner, price, discount, info, steamId, recommended, minimum, publisher, dlc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [title, category, image, banner, JSON.stringify(finalPrice), discount, info, steamId, recommended, minimum, publisher, dlc]
    )
    return result
}

export async function updateGamePrice(price, discount, steamId) {
    const [result] = await pool.query(
        "UPDATE products SET price = ?, discount = ? WHERE steamId = ?",
        [price, discount, steamId]
    )
}

export async function updatePriceById(price, discount, id) {
    const [result] = await pool.query(
        "UPDATE products SET price = ?, discount = ? WHERE steamId = ?"
    )
}

export async function getProductBySteamId(steamId){
    const [result] = await pool.query("SELECT * FROM products WHERE steamId = ?", [steamId])
    return result
}

export async function getProductById(id) {
    const [result] = await pool.query("SELECT * FROM products WHERE id = ?", [id])
    return result
}

export async function updateProductById(id, title, category, image, banner, price, discount, info, recommended, minimum, publisher, dlc){
    const [result] = await pool.query(
        "UPDATE products SET title = ?, category = ?, image = ?, banner = ?, price = ?, discount = ?, info = ?, recommended = ?, minimum = ?, publisher = ?, dlc = ? WHERE id = ?",
        [title, category, image, banner, price, discount, info, id, recommended, minimum, publisher, dlc]
    )
}

export async function getAllCategories() {
    const [result] = await pool.query(
        "SELECT DISTINCT category FROM products"
    );
    return result.map(row => row.category);
}