from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from contextlib import contextmanager

app = FastAPI()

# CORS middleware (allows frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection helper
@contextmanager
def get_db():
    conn = sqlite3.connect('inventory.db')
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

# Models for data validation
class Product(BaseModel):
    sku: str
    name: str
    price: float
    stock: int
    category: str = ""

class Customer(BaseModel):
    name: str
    email: str
    phone: str = ""
    address: str = ""

class Order(BaseModel):
    customerEmail: str
    productId: int
    quantity: int

# Initialize database on startup
@app.on_event("startup")
def init_db():
    with get_db() as conn:
        # Create products table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT UNIQUE,
                name TEXT,
                price REAL,
                stock INTEGER,
                category TEXT
            )
        ''')
        
        # Create customers table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                phone TEXT,
                address TEXT
            )
        ''')
        
        # Create orders table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customerEmail TEXT,
                productName TEXT,
                quantity INTEGER,
                total REAL,
                date TEXT,
                status TEXT
            )
        ''')
        
        # Insert demo data if tables are empty
        cursor = conn.execute("SELECT COUNT(*) FROM products")
        if cursor.fetchone()[0] == 0:
            demo_products = [
                ('LAP-001', 'MacBook Pro M3', 1999, 15, 'Electronics'),
                ('PHN-002', 'iPhone 15 Pro', 1099, 8, 'Electronics'),
                ('HD-003', 'Sony Headphones', 299, 25, 'Audio'),
                ('MON-004', 'Dell Monitor', 449, 3, 'Electronics'),
                ('KBD-005', 'Mechanical Keyboard', 129, 12, 'Accessories'),
                ('MOU-006', 'Logitech Mouse', 49, 30, 'Accessories'),
                ('CHA-007', 'Gaming Chair', 399, 5, 'Furniture'),
                ('USB-008', 'USB-C Hub', 79, 18, 'Accessories')
            ]
            conn.executemany(
                "INSERT INTO products (sku, name, price, stock, category) VALUES (?, ?, ?, ?, ?)",
                demo_products
            )
        
        cursor = conn.execute("SELECT COUNT(*) FROM customers")
        if cursor.fetchone()[0] == 0:
            demo_customers = [
                ('Alice Johnson', 'alice@example.com', '+1 234-567-8901', '123 Main St, NY'),
                ('Bob Smith', 'bob@example.com', '+1 234-567-8902', '456 Oak Ave, CA'),
                ('Carol Davis', 'carol@example.com', '+1 234-567-8903', '789 Pine Rd, TX'),
                ('David Wilson', 'david@example.com', '+1 234-567-8904', '321 Elm St, FL')
            ]
            conn.executemany(
                "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
                demo_customers
            )

# ============ PRODUCTS API ============
@app.get("/products")
def get_products():
    with get_db() as conn:
        products = conn.execute("SELECT * FROM products").fetchall()
        return [dict(product) for product in products]

@app.post("/products")
def create_product(product: Product):
    with get_db() as conn:
        try:
            cursor = conn.execute(
                "INSERT INTO products (sku, name, price, stock, category) VALUES (?, ?, ?, ?, ?)",
                (product.sku, product.name, product.price, product.stock, product.category)
            )
            return {"id": cursor.lastrowid, **product.dict()}
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="SKU already exists")

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
        return {"message": "Product deleted"}

# ============ CUSTOMERS API ============
@app.get("/customers")
def get_customers():
    with get_db() as conn:
        customers = conn.execute("SELECT * FROM customers").fetchall()
        return [dict(customer) for customer in customers]

@app.post("/customers")
def create_customer(customer: Customer):
    with get_db() as conn:
        try:
            cursor = conn.execute(
                "INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)",
                (customer.name, customer.email, customer.phone, customer.address)
            )
            return {"id": cursor.lastrowid, **customer.dict()}
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Email already exists")

@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM customers WHERE id = ?", (customer_id,))
        return {"message": "Customer deleted"}

# ============ ORDERS API ============
@app.get("/orders")
def get_orders():
    with get_db() as conn:
        orders = conn.execute("SELECT * FROM orders ORDER BY id DESC").fetchall()
        return [dict(order) for order in orders]

@app.post("/orders")
def create_order(order: Order):
    with get_db() as conn:
        # Get product details
        product = conn.execute(
            "SELECT * FROM products WHERE id = ?", (order.productId,)
        ).fetchone()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        if product['stock'] < order.quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
        
        # Update stock
        conn.execute(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            (order.quantity, order.productId)
        )
        
        # Create order
        from datetime import date
        total = product['price'] * order.quantity
        cursor = conn.execute(
            "INSERT INTO orders (customerEmail, productName, quantity, total, date, status) VALUES (?, ?, ?, ?, ?, ?)",
            (order.customerEmail, product['name'], order.quantity, total, str(date.today()), 'processing')
        )
        
        return {
            "id": cursor.lastrowid,
            "customerEmail": order.customerEmail,
            "productName": product['name'],
            "quantity": order.quantity,
            "total": total,
            "date": str(date.today()),
            "status": "processing"
        }

@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM orders WHERE id = ?", (order_id,))
        return {"message": "Order deleted"}

@app.get("/")
def root():
    return {"message": "Inventory Management System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)