const API_URL = 'https://your-backend.onrender.com'; // Replace with your Render URL

export const fetchProducts = async () => {
  const res = await fetch(`${API_URL}/products`);
  return res.json();
};

export const createProduct = async (product) => {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(product)
  });
  return res.json();
};

export const placeOrder = async (order) => {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(order)
  });
  return res.json();
};