import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.SQLITE_PATH || "./data.db";
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function connectDatabase() {
    try {
        db.prepare("SELECT 1").get();
        console.log("connected to database");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    phone TEXT UNIQUE,
    password TEXT,
    score INTEGER DEFAULT 0,
    role TEXT DEFAULT 'user'
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
    discount TEXT,
    realDiscount INTEGER DEFAULT 0,
    info TEXT,
    steamId TEXT UNIQUE,
    recommended TEXT,
    minimum TEXT,
    publisher TEXT,
    dlc TEXT
)
`);

db.exec(`
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quantity INTEGER DEFAULT 1,
    info TEXT,
    userId INTEGER,
    productId INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
)
`);

db.exec(`
CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_steamId ON products(steamId);
`);

function parseProduct(row) {
    if (!row) return row;
    if (row.price && typeof row.price === 'string') {
        try {
            row.price = JSON.parse(row.price);
        } catch (e) {
            console.error('Failed to parse product price:', e);
        }
    }
    return row;
}

function parseOrder(row) {
    if (!row) return row;
    if (row.info && typeof row.info === 'string') {
        try {
            row.info = JSON.parse(row.info);
        } catch (e) {
            console.error('Failed to parse order info:', e);
        }
    }
    return row;
}

const createUserStmt = db.prepare(
    "INSERT INTO users (firstname, lastname, email, phone, password) VALUES (?, ?, ?, ?, ?)"
);

export function createUser(firstname, lastname, email, phone, password) {
    try {
        const result = createUserStmt.run(firstname, lastname, email, phone, password);
        return { insertId: result.lastInsertRowid, changes: result.changes };
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
}

const getUserByIdStmt = db.prepare("SELECT * FROM users WHERE id = ?");

export function getUserById(id) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid user ID provided:', id);
        return null;
    }
    try {
        const row = getUserByIdStmt.get(id);
        return row || null;
    } catch (err) {
        console.error('Error getting user by ID:', err);
        return null;
    }
}

const getUserByNumberStmt = db.prepare("SELECT * FROM users WHERE phone = ?");

export function getUserByNumber(phone) {
    if (!phone || typeof phone !== 'string') {
        console.error('Invalid phone number provided:', phone);
        return null;
    }
    try {
        const row = getUserByNumberStmt.get(phone);
        return row || null;
    } catch (err) {
        console.error('Error getting user by number:', err);
        return null;
    }
}

const updateUserByIdStmt = db.prepare(
    "UPDATE users SET firstname = ?, lastname = ?, phone = ?, email = ?, password = ? WHERE id = ?"
);

export function updateUserById(id, firstname, lastname, phone, email, password) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid user ID for update:', id);
        return null;
    }
    try {
        const result = updateUserByIdStmt.run(firstname, lastname, phone, email, password, id);
        return { changes: result.changes };
    } catch (err) {
        console.error('Error updating user:', err);
        throw err;
    }
}

const getProductsByCategoryStmt = db.prepare(
    "SELECT * FROM products WHERE category = ? ORDER BY id DESC LIMIT ? OFFSET ?"
);
const countProductsByCategoryStmt = db.prepare(
    "SELECT COUNT(*) as count FROM products WHERE category = ?"
);

export function getProductsByCategory(category, page = 1, limit = 20) {
    if (!category || typeof category !== 'string') {
        console.error('Invalid category provided:', category);
        return { data: [], total: 0, page, totalPages: 0 };
    }
    try {
        const offset = (page - 1) * limit;
        const rows = getProductsByCategoryStmt.all(category, limit, offset);
        const total = countProductsByCategoryStmt.get(category).count;
        return {
            data: rows.map(parseProduct),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (err) {
        console.error('Error getting products by category:', err);
        return { data: [], total: 0, page, totalPages: 0 };
    }
}

const getAllProductsStmt = db.prepare(
    "SELECT * FROM products ORDER BY id DESC LIMIT ? OFFSET ?"
);
const countAllProductsStmt = db.prepare("SELECT COUNT(*) as count FROM products");

export function getAllProducts(page = 1, limit = 20) {
    try {
        const offset = (page - 1) * limit;
        const rows = getAllProductsStmt.all(limit, offset);
        const total = countAllProductsStmt.get().count;
        return {
            data: rows.map(parseProduct),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (err) {
        console.error('Error getting all products:', err);
        return { data: [], total: 0, page, totalPages: 0 };
    }
}

const getAllProductsNotSteamStmt = db.prepare(
    "SELECT * FROM products WHERE category != 'steam';"
);

export function getAllProductsNotSteam(){
    try{
        return getAllProductsNotSteamStmt.all()
    }catch(err){
        console.log(err);
    }
}

const createProductStmt = db.prepare(
    "INSERT INTO products (title, category, image, banner, price, discount, info, steamId, recommended, minimum, publisher, dlc) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

export function createProduct(title, category, image, banner, price, discount, info, steamId, recommended, minimum, publisher, dlc) {
    try {
        const priceStr = typeof price === 'string' ? price : JSON.stringify(price);
        const result = createProductStmt.run(
            title,
            category,
            image,
            banner,
            priceStr,
            discount || 0,
            info,
            steamId || null,
            recommended || null,
            minimum || null,
            publisher || null,
            dlc || null
        );
        return { insertId: result.lastInsertRowid, changes: result.changes };
    } catch (err) {
        console.error('Error creating product:', err);
        throw err;
    }
}

const deleteProductByIdStmt = db.prepare("DELETE FROM products WHERE id = ?");

export function deleteProductById(id) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid product ID for delete:', id);
        return null;
    }
    try {
        const result = deleteProductByIdStmt.run(id);
        return { changes: result.changes };
    } catch (err) {
        console.error('Error deleting product:', err);
        throw err;
    }
}

const updateGamePriceStmt = db.prepare(
    "UPDATE products SET price = ?, discount = ? WHERE steamId = ?"
);

export function updateGamePrice(price, discount, steamId) {
    if (!steamId) {
        console.error('Invalid steam ID for update:', steamId);
        return null;
    }
    try {
        const stringId = String(steamId);
        const priceStr = typeof price === 'string' ? price : JSON.stringify(price);
        const result = updateGamePriceStmt.run(priceStr, discount || 0, stringId);
        return { changes: result.changes };
    } catch (err) {
        console.error('Error updating game price:', err);
        throw err;
    }
}

const updateProductPriceStmt = db.prepare(
    "UPDATE products SET price = ? WHERE id = ?"
);

export function updateProductPrice(price, id) {
    try {
        updateProductPrice.run(price, id)
    } catch (err) {
        console.error('Error updating price:', err);
        throw err;
    }
}

const updatePriceByIdStmt = db.prepare(
    "UPDATE products SET price = ?, discount = ? WHERE id = ?"
);

export function updatePriceById(price, discount, id) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid product ID for price update:', id);
        return null;
    }
    try {
        const priceStr = typeof price === 'string' ? price : JSON.stringify(price);
        const result = updatePriceByIdStmt.run(priceStr, discount || 0, id);
        return { changes: result.changes };
    } catch (err) {
        console.error('Error updating price by ID:', err);
        throw err;
    }
}

const getProductBySteamIdStmt = db.prepare("SELECT * FROM products WHERE steamId = ?");

export function getProductBySteamId(steamId) {
    if (!steamId) {
        console.error('Invalid steam ID:', steamId);
        return [];
    }
    try {
        const stringId = String(steamId);
        const rows = getProductBySteamIdStmt.all(stringId);
        return rows.map(parseProduct);
    } catch (err) {
        console.error('Error getting product by steam ID:', err);
        return [];
    }
}

const getProductByIdStmt = db.prepare("SELECT * FROM products WHERE id = ?");

export function getProductById(id) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid product ID:', id);
        return [];
    }
    try {
        const rows = getProductByIdStmt.all(id);
        return rows.map(parseProduct);
    } catch (err) {
        console.error('Error getting product by ID:', err);
        return [];
    }
}

const updateProductByIdStmt = db.prepare(
    "UPDATE products SET title = ?, category = ?, price = ?, discount = ?, info = ?, recommended = ?, minimum = ?, publisher = ?, dlc = ? WHERE id = ?"
);

export function updateProductById(id, title, category, price, discount, info, recommended, minimum, publisher, dlc) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid product ID for update:', id);
        return null;
    }
    try {
        const priceStr = typeof price === 'string' ? price : JSON.stringify(price);
        const result = updateProductByIdStmt.run(
            title,
            category,
            priceStr,
            discount || 0,
            info,
            recommended || null,
            minimum || null,
            publisher || null,
            dlc || null,
            id
        );
        return { changes: result.changes };
    } catch (err) {
        console.error('Error updating product:', err);
        throw err;
    }
}

const getAllCategoriesStmt = db.prepare("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' GROUP BY category ORDER BY MIN(id);");

export function getAllCategories() {
    try {
        const rows = getAllCategoriesStmt.all();
        return rows.map(row => row.category);
    } catch (err) {
        console.error('Error getting all categories:', err);
        return [];
    }
}

const createOrderStmt = db.prepare(
    "INSERT INTO orders (userId, productId, quantity, info) VALUES (?, ?, ?, ?)"
);

export function createOrder(userId, productId, quantity, info) {
    if (!userId || typeof userId !== 'number') {
        console.error('Invalid user ID for order:', userId);
        return null;
    }
    if (!productId || typeof productId !== 'number') {
        console.error('Invalid product ID for order:', productId);
        return null;
    }
    try {
        const infoStr = typeof info === 'string' ? info : JSON.stringify(info);
        const result = createOrderStmt.run(userId, productId, quantity || 1, infoStr);
        return { insertId: result.lastInsertRowid, changes: result.changes };
    } catch (err) {
        console.error('Error creating order:', err);
        throw err;
    }
}

const getOrdersByUserIDStmt = db.prepare("SELECT * FROM orders WHERE userId = ? ORDER BY id DESC LIMIT ? OFFSET ?");
const countOrdersByUserIDStmt = db.prepare("SELECT COUNT(*) as count FROM orders WHERE userId = ?");

export function getOrdersByUserID(id, page = 1, limit = 20) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid user ID for orders:', id);
        return { data: [], total: 0, page, totalPages: 0 };
    }
    try {
        const offset = (page - 1) * limit;
        const rows = getOrdersByUserIDStmt.all(id, limit, offset);
        const total = countOrdersByUserIDStmt.get(id).count;
        return {
            data: rows.map(parseOrder),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (err) {
        console.error('Error getting orders by user ID:', err);
        return { data: [], total: 0, page, totalPages: 0 };
    }
}

const updateOrderByIDStmt = db.prepare(
    "UPDATE orders SET quantity = ?, info = ? WHERE id = ?"
);

export function updateOrderByID(id, quantity, info) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid order ID for update:', id);
        return null;
    }
    try {
        const infoStr = typeof info === 'string' ? info : JSON.stringify(info);
        const result = updateOrderByIDStmt.run(quantity || 1, infoStr, id);
        return { changes: result.changes };
    } catch (err) {
        console.error('Error updating order:', err);
        throw err;
    }
}

const deleteOrderByIDStmt = db.prepare("DELETE FROM orders WHERE id = ?");

export function deleteOrderByID(id) {
    if (!id || typeof id !== 'number') {
        console.error('Invalid order ID for delete:', id);
        return null;
    }
    try {
        const result = deleteOrderByIDStmt.run(id);
        return { changes: result.changes };
    } catch (err) {
        console.error('Error deleting order:', err);
        throw err;
    }
}

const getDiscountProductsStmt = db.prepare(`
    SELECT * FROM products
    WHERE json_extract(discount, '$.percent') > 0 OR realDiscount > 0
    ORDER BY
        CASE WHEN json_extract(discount, '$.expires') IS NULL THEN 1 ELSE 0 END,
        json_extract(discount, '$.expires') ASC,
        id DESC
    LIMIT ? OFFSET ?
`);
const countDiscountProductsStmt = db.prepare("SELECT COUNT(*) as count FROM products WHERE json_extract(discount, '$.percent') > 0 OR realDiscount > 0");

export function getDiscountProducts(page = 1, limit = 20) {
    try {
        const offset = (page - 1) * limit;
        const rows = getDiscountProductsStmt.all(limit, offset);
        const total = countDiscountProductsStmt.get().count;
        return {
            data: rows.map(parseProduct),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (err) {
        console.error('Error getting discount products:', err);
        return { data: [], total: 0, page, totalPages: 0 };
    }
}

const searchProductsStmt = db.prepare(
    "SELECT * FROM products WHERE title LIKE ? ORDER BY id DESC LIMIT ?"
);

export function searchProducts(query, limit = 20) {
    if (!query || typeof query !== 'string') {
        return [];
    }
    try {
        const rows = searchProductsStmt.all(`%${query}%`, limit);
        return rows.map(parseProduct);
    } catch (err) {
        console.error('Error searching products:', err);
        return [];
    }
}

export function closeDatabase() {
    try {
        db.close();
        console.log('Database connection closed');
    } catch (err) {
        console.error('Error closing database:', err);
    }
}

export { db };