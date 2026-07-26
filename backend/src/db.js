import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(process.env.SQLITE_PATH || "./data.db");

export function connectDatabase() {
    try {
        db.prepare("SELECT 1").get();
        console.log("connected to database");
    } catch (err) {
        console.error(err);
    }
}

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    phone TEXT,
    password TEXT,
    score INTEGER,
    role TEXT
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    image TEXT,
    banner TEXT,
    price TEXT,
    discount INTEGER,
    realDiscount INTEGER,
    info TEXT,
    steamId TEXT,
    recommended TEXT,
    minimum TEXT,
    publisher TEXT,
    dlc TEXT
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quantity INTEGER,
    info TEXT,
    userId INTEGER,
    productId INTEGER,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id)
)
`);

function parseProduct(row) {
    if (!row) return row;
    return { ...row, price: row.price ? JSON.parse(row.price) : row.price };
}

function parseOrder(row) {
    if (!row) return row;
    return { ...row, info: row.info ? JSON.parse(row.info) : row.info };
}

export function createUser(firstname, lastname, email, phone, password) {
    const result = db.prepare(
        "INSERT INTO users (firstname, lastname, email, phone, password) VALUES (?, ?, ?, ?, ?)"
    ).run(firstname, lastname, email, phone, password);
    return result;
}

export function getUserById(id) {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export function getUserByNumber(phone) {
    return db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
}

export function updateUserById(id, firstname, lastname, phone, email, password) {
    const result = db.prepare(
        "UPDATE users SET firstname = ?, lastname = ?, phone = ?, email = ?, password = ? WHERE id = ?"
    ).run(firstname, lastname, phone, email, password, id);
    return result;
}

export function getProductsByCategory(category) {
    const result = db.prepare("SELECT * FROM products WHERE category = ?").all(category);
    return result.map(parseProduct);
}

export function getAllProducts() {
    const result = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
    return result.map(parseProduct);
}

export function createProduct(title, category, image, banner, price, discount, info, steamId, recommended, minimum, publisher, dlc) {
    const result = db.prepare(
        "INSERT INTO products (title, category, image, banner, price, discount, info, steamId, recommended, minimum, publisher, dlc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(title, category, image, banner, JSON.stringify(price), discount, info, steamId, recommended, minimum, publisher, dlc);
    return result;
}

export function deleteProductById(id) {
    const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);
    return result;
}

export function updateGamePrice(price, discount, steamId) {
    const result = db.prepare(
        "UPDATE products SET price = ?, discount = ? WHERE steamId = ?"
    ).run(JSON.stringify(price), discount, steamId);
    return result;
}

export function updatePriceById(price, discount, id) {
    const result = db.prepare(
        "UPDATE products SET price = ?, discount = ? WHERE id = ?"
    ).run(JSON.stringify(price), discount, id);
    return result;
}

export function getProductBySteamId(steamId) {
    const result = db.prepare("SELECT * FROM products WHERE steamId = ?").all(steamId);
    return result.map(parseProduct);
}

export function getProductById(id) {
    const result = db.prepare("SELECT * FROM products WHERE id = ?").all(id);
    return result.map(parseProduct);
}

export function updateProductById(id, title, category, image, banner, price, discount, info, recommended, minimum, publisher, dlc) {
    const result = db.prepare(
        "UPDATE products SET title = ?, category = ?, image = ?, banner = ?, price = ?, discount = ?, info = ?, recommended = ?, minimum = ?, publisher = ?, dlc = ? WHERE id = ?"
    ).run(title, category, image, banner, JSON.stringify(price), discount, info, recommended, minimum, publisher, dlc, id);
    return result;
}

export function getAllCategories() {
    const result = db.prepare("SELECT DISTINCT category FROM products").all();
    return result.map(row => row.category);
}

export function createOrder(userId, productId, quantity, info) {
    const result = db.prepare(
        "INSERT INTO orders (userId, productId, quantity, info) VALUES (?, ?, ?, ?)"
    ).run(userId, productId, quantity, JSON.stringify(info));
    return result;
}

export function getOrdersByUserID(id) {
    const result = db.prepare("SELECT * FROM orders WHERE userId = ?").all(id);
    return result.map(parseOrder);
}

export function updateOrderByID(id, quantity, info) {
    const result = db.prepare(
        "UPDATE orders SET quantity = ?, info = ? WHERE id = ?"
    ).run(quantity, JSON.stringify(info), id);
    return result;
}

export function deleteOrderByID(id) {
    const result = db.prepare("DELETE FROM orders WHERE id = ?").run(id);
    return result;
}

export function getDiscountProducts() {
    const result = db.prepare("SELECT * FROM products WHERE discount > 0 OR realDiscount > 0").all();
    return result.map(parseProduct);
}