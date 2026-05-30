// Use your actual live backend URL
const API_URL = 'https://inventory-backend.onrender.com';

export const fetchProducts = async () => {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
};

export const createProduct = async (product) => {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(product)
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
};

export const fetchCustomers = async () => {
  const res = await fetch(`${API_URL}/customers`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
};

export const createCustomer = async (customer) => {
  const res = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(customer)
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json();
};

export const placeOrder = async (order) => {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(order)
  });
  if (!res.ok) throw new Error('Failed to place order');
  return res.json();
};

export const fetchOrders = async () => {
  const res = await fetch(`${API_URL}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
};

export const deleteCustomer = async (id) => {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete customer');
  return res.json();
};

export const deleteOrder = async (id) => {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete order');
  return res.json();
};