-- Database schema for Heritage876 School Project

CREATE DATABASE IF NOT EXISTS heritage876;
USE heritage876;

-- 1. Users Table
-- Requirements: ID, name, email, encrypted password
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Will store bcrypted hashes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
-- Requirements: ID, name, price, description, image
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Orders Table (Basic Structure)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Order Items (Helper table for a complete project)
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Initial product data seed based on your existing catalog
INSERT INTO products (name, price, description, image_url) VALUES 
('Domino Board', 6500, 'Authentic Jamaican domino board made from premium wood.', '/dominoboardja.jpg'),
('Jamaican Domino', 2500, 'Classic double-six domino set complete with traditional markings.', '/jadomino.jpg'),
('Guinea Henweed', 1000, 'Freshly dried Guinea Henweed, a powerful traditional herb.', '/leaf.jpeg'),
('Devon House', 4200, 'A beautiful representation of the iconic Devon House in Kingston.', '/istockphoto-498732159-612x612.jpg');
