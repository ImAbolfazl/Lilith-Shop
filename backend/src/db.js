import mysql from "mysql2"

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise()

export async function createUser(firstname, lastname, gmail, password){
    const [result] = await pool.query(
        "INSERT INTO users (firstname, lastname, gmail, password) VALUES (?, ?, ?, ?)",
        [firstname, lastname, gmail, password]
    )
    return result;
}

export async function getUserById(id) {
    const [result] = await pool.query("SELECT * FROM users WHERE id = ?", [id])
    return result
}

export async function getProductsByCategory(category) {
    const [result] = await pool.query("SELECT * FROM products WHERE category = ?", [category])
    return result
}

export async function getAllProducts() {
    const [result] = await pool.query("SELECT * FROM products")
    return result
}

export async function createProduct(title, category, image, banner, price, discountPrice, discount, info, steamId) {
    const [result] = await pool.query(
        "INSERT INTO products (title, category, image, banner, price, discountPrice, discount, info, steamId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [title, category, image, banner, price, discountPrice, discount, info, steamId]
    )
    return result
}

export async function updateGamePrice(price, discount, steamId) {
    const [result] = await pool.query(
        "UPDATE products SET price = ?, discount = ? WHERE steamId = ?",
        [price, discount, steamId]
    )
}

export async function getProductBySteamId(id){
    const [result] = await pool.query("SELECT * FROM products WHERE steamId = ?", [id])
    return result
}