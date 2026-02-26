const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save to DB
        await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// --- PRODUCT ROUTES ---

// --- ORDER ROUTES ---

app.post('/api/orders', async (req, res) => {
    const { userId, totalAmount, items } = req.body;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [userId, totalAmount, 'completed']
        );
        const orderId = orderResult.insertId;

        // 2. Create Order Items
        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        await connection.rollback();
        console.error('Order placement error:', error);
        res.status(500).json({ message: 'Server error', error });
    } finally {
        connection.release();
    }
});

app.get('/api/orders/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
        res.json(orders);
    } catch (error) {
        console.error('Orders fetch error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


app.get('/api/products', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        console.error('Products fetch error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
