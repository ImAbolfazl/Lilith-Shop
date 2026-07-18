import mysql from "mysql2"

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
}).promise()

export async function createUser(firstname, lastname, phone, password){
    const [result] = await pool.query(
        "INSERT INTO users (firstname, lastname, phone, password) VALUES (?, ?, ?, ?)",
        [firstname, lastname, phone, password]
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

export async function getProductBySteamId(steamId){
    const [result] = await pool.query("SELECT * FROM products WHERE steamId = ?", [steamId])
    return result
}

export async function getProductById(id) {
    const [result] = await pool.query("SELECT * FROM products WHERE id = ?", [id])
    return result
}

export async function updateProductById(id, title, category, image, banner, price, discountedPrice, discount, info){
    const [result] = await pool.query(
        "UPDATE products SET title = ?, category = ?, image = ?, banner = ?, price = ?, discountedPrice = ?, discount = ?, info = ? WHERE id = ?",
        [title, category, image, banner, price, discountedPrice, discount, info, id]
    )
}

export async function getAllCategories() {
    const [result] = await pool.query(
        "SELECT DISTINCT category FROM products"
    );
    return result.map(row => row.category);
}