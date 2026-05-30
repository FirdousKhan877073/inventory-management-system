import React, { useState, useEffect } from 'react';

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, totalOrders: 0, revenue: 0 });
  
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', price: 0, stock: 0, category: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [newOrder, setNewOrder] = useState({ customerEmail: '', productId: '', quantity: 1 });

  // FETCH FROM BACKEND (with demo data fallback)
  useEffect(() => {
    const demoProducts = [
      { id: 1001, sku: 'LAP-001', name: 'MacBook Pro M3', price: 1999, stock: 15, category: 'Electronics' },
      { id: 1002, sku: 'PHN-002', name: 'iPhone 15 Pro', price: 1099, stock: 8, category: 'Electronics' },
      { id: 1003, sku: 'HD-003', name: 'Sony Headphones', price: 299, stock: 25, category: 'Audio' },
      { id: 1004, sku: 'MON-004', name: 'Dell Monitor', price: 449, stock: 3, category: 'Electronics' },
      { id: 1005, sku: 'KBD-005', name: 'Mechanical Keyboard', price: 129, stock: 12, category: 'Accessories' },
      { id: 1006, sku: 'MOU-006', name: 'Logitech Mouse', price: 49, stock: 30, category: 'Accessories' },
      { id: 1007, sku: 'CHA-007', name: 'Gaming Chair', price: 399, stock: 5, category: 'Furniture' },
      { id: 1008, sku: 'USB-008', name: 'USB-C Hub', price: 79, stock: 18, category: 'Accessories' }
    ];
    
    const demoCustomers = [
      { id: 2001, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 234-567-8901', address: '123 Main St, NY' },
      { id: 2002, name: 'Bob Smith', email: 'bob@example.com', phone: '+1 234-567-8902', address: '456 Oak Ave, CA' },
      { id: 2003, name: 'Carol Davis', email: 'carol@example.com', phone: '+1 234-567-8903', address: '789 Pine Rd, TX' },
      { id: 2004, name: 'David Wilson', email: 'david@example.com', phone: '+1 234-567-8904', address: '321 Elm St, FL' }
    ];
    
    const demoOrders = [
      { id: 3001, customerEmail: 'alice@example.com', productName: 'MacBook Pro M3', quantity: 1, total: 1999, date: '2024-01-15', status: 'delivered' },
      { id: 3002, customerEmail: 'bob@example.com', productName: 'iPhone 15 Pro', quantity: 2, total: 2198, date: '2024-01-20', status: 'shipped' },
      { id: 3003, customerEmail: 'carol@example.com', productName: 'Sony Headphones', quantity: 1, total: 299, date: '2024-01-25', status: 'processing' }
    ];

    // Try to fetch from backend first
    Promise.all([
      fetch('http://localhost:8000/products').then(res => res.json()).catch(() => null),
      fetch('http://localhost:8000/customers').then(res => res.json()).catch(() => null),
      fetch('http://localhost:8000/orders').then(res => res.json()).catch(() => null)
    ]).then(([productsData, customersData, ordersData]) => {
      // Use backend data if available, otherwise use demo data
      setProducts(productsData && productsData.length > 0 ? productsData : demoProducts);
      setCustomers(customersData && customersData.length > 0 ? customersData : demoCustomers);
      setOrders(ordersData && ordersData.length > 0 ? ordersData : demoOrders);
    }).catch(() => {
      // Fallback to demo data
      setProducts(demoProducts);
      setCustomers(demoCustomers);
      setOrders(demoOrders);
    });
  }, []);

  // Update stats
  useEffect(() => {
    setStats({
      totalProducts: products.length,
      lowStock: products.filter(p => p.stock < 5).length,
      totalOrders: orders.length,
      revenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
    });
  }, [products, orders]);

  const addProduct = async () => {
    if (!newProduct.sku || !newProduct.name || !newProduct.price) {
      alert('Please fill all required fields');
      return;
    }
    if (products.find(p => p.sku === newProduct.sku)) {
      alert('SKU must be unique');
      return;
    }
    
    const productData = {
      sku: newProduct.sku,
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      category: newProduct.category
    };
    
    try {
      // Try to save to backend
      const response = await fetch('http://localhost:8000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        const savedProduct = await response.json();
        setProducts([...products, savedProduct]);
      } else {
        throw new Error('Backend save failed');
      }
    } catch (error) {
      // Fallback: save locally with generated ID
      console.log('Backend not available, saving locally');
      setProducts([...products, { 
        id: Date.now(), 
        ...productData
      }]);
    }
    
    setNewProduct({ sku: '', name: '', price: 0, stock: 0, category: '' });
    setShowModal(false);
  };

  const addCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert('Name and Email required');
      return;
    }
    if (customers.find(c => c.email === newCustomer.email)) {
      alert('Email must be unique');
      return;
    }
    
    const customerData = {
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address
    };
    
    try {
      const response = await fetch('http://localhost:8000/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      
      if (response.ok) {
        const savedCustomer = await response.json();
        setCustomers([...customers, savedCustomer]);
      } else {
        throw new Error('Backend save failed');
      }
    } catch (error) {
      console.log('Backend not available, saving locally');
      setCustomers([...customers, { id: Date.now(), ...customerData }]);
    }
    
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    setShowModal(false);
  };

  const placeOrder = async () => {
    const product = products.find(p => p.id === parseInt(newOrder.productId));
    if (!product) {
      alert('Select a product');
      return;
    }
    if (product.stock < newOrder.quantity) {
      alert(`Insufficient stock! Only ${product.stock} left`);
      return;
    }
    
    try {
      // Try to save order to backend
      const response = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: newOrder.customerEmail,
          productId: parseInt(newOrder.productId),
          quantity: newOrder.quantity
        })
      });
      
      if (response.ok) {
        const newOrderData = await response.json();
        setOrders([newOrderData, ...orders]);
        // Update stock
        setProducts(products.map(p => 
          p.id === product.id ? { ...p, stock: p.stock - newOrder.quantity } : p
        ));
      } else {
        throw new Error('Backend order failed');
      }
    } catch (error) {
      // Fallback: save locally
      console.log('Backend not available, saving order locally');
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, stock: p.stock - newOrder.quantity } : p
      ));
      setOrders([{
        id: Date.now(),
        customerEmail: newOrder.customerEmail,
        productName: product.name,
        quantity: newOrder.quantity,
        total: product.price * newOrder.quantity,
        date: new Date().toISOString().split('T')[0],
        status: 'processing'
      }, ...orders]);
    }
    
    alert('Order placed successfully!');
    setNewOrder({ customerEmail: '', productId: '', quantity: 1 });
    setShowModal(false);
  };

  const deleteItem = async (type, id) => {
    if (confirm('Are you sure?')) {
      try {
        // Try to delete from backend
        if (type === 'product') {
          await fetch(`http://localhost:8000/products/${id}`, { method: 'DELETE' });
          setProducts(products.filter(p => p.id !== id));
        }
        if (type === 'customer') {
          await fetch(`http://localhost:8000/customers/${id}`, { method: 'DELETE' });
          setCustomers(customers.filter(c => c.id !== id));
        }
        if (type === 'order') {
          await fetch(`http://localhost:8000/orders/${id}`, { method: 'DELETE' });
          setOrders(orders.filter(o => o.id !== id));
        }
      } catch (error) {
        // Fallback: delete locally only
        console.log('Backend not available, deleting locally');
        if (type === 'product') setProducts(products.filter(p => p.id !== id));
        if (type === 'customer') setCustomers(customers.filter(c => c.id !== id));
        if (type === 'order') setOrders(orders.filter(o => o.id !== id));
      }
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span style={{background: '#dc3545', padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '12px'}}>Out of Stock</span>;
    if (stock < 5) return <span style={{background: '#ffc107', padding: '4px 8px', borderRadius: '4px', color: '#333', fontSize: '12px'}}>Low Stock</span>;
    return <span style={{background: '#28a745', padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '12px'}}>In Stock</span>;
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{fontFamily: 'Segoe UI, Arial', background: '#f5f5f5', minHeight: '100vh'}}>
      {/* Header */}
      <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h1 style={{margin: 0, fontSize: '32px'}}>📦 Inventory Management System</h1>
          <p style={{margin: '10px 0 0', opacity: 0.9}}>Manage products, customers, and orders efficiently</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{maxWidth: '1200px', margin: '-20px auto 20px', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
        <div style={{background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <div style={{fontSize: '36px', color: '#667eea'}}>📦</div>
          <div style={{fontSize: '28px', fontWeight: 'bold'}}>{stats.totalProducts}</div>
          <div style={{color: '#666'}}>Total Products</div>
        </div>
        <div style={{background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <div style={{fontSize: '36px', color: '#ffc107'}}>⚠️</div>
          <div style={{fontSize: '28px', fontWeight: 'bold'}}>{stats.lowStock}</div>
          <div style={{color: '#666'}}>Low Stock Items</div>
        </div>
        <div style={{background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <div style={{fontSize: '36px', color: '#28a745'}}>🛒</div>
          <div style={{fontSize: '28px', fontWeight: 'bold'}}>{stats.totalOrders}</div>
          <div style={{color: '#666'}}>Total Orders</div>
        </div>
        <div style={{background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <div style={{fontSize: '36px', color: '#17a2b8'}}>💰</div>
          <div style={{fontSize: '28px', fontWeight: 'bold'}}>${stats.revenue.toLocaleString()}</div>
          <div style={{color: '#666'}}>Total Revenue</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        {/* Tabs */}
        <div style={{display: 'flex', gap: '10px', borderBottom: '2px solid #e0e0e0', marginBottom: '20px'}}>
          {['products', 'customers', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: 'none',
                color: activeTab === tab ? '#667eea' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                borderBottom: activeTab === tab ? '3px solid #667eea' : 'none',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search and Add Button */}
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '20px'}}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
          />
          <button
            onClick={() => {
              setModalType(activeTab.slice(0, -1));
              setShowModal(true);
            }}
            style={{padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
          >
            + Add {activeTab.slice(0, -1)}
          </button>
        </div>

        {/* Products Table */}
        {activeTab === 'products' && (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                  <th style={{padding: '12px', textAlign: 'left'}}>ID</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>SKU</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Name</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Category</th>
                  <th style={{padding: '12px', textAlign: 'right'}}>Price</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Stock</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Status</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} style={{borderBottom: '1px solid #dee2e6'}}>
                    <td style={{padding: '12px'}}>{p.id}</td>
                    <td style={{padding: '12px'}}><code style={{background: '#f4f4f4', padding: '2px 6px', borderRadius: '3px'}}>{p.sku}</code></td>
                    <td style={{padding: '12px', fontWeight: '500'}}>{p.name}</td>
                    <td style={{padding: '12px'}}>{p.category || '-'}</td>
                    <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#28a745'}}>${p.price}</td>
                    <td style={{padding: '12px', textAlign: 'center'}}>{p.stock}</td>
                    <td style={{padding: '12px', textAlign: 'center'}}>{getStockBadge(p.stock)}</td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <button onClick={() => deleteItem('product', p.id)} style={{background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer'}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customers Table */}
        {activeTab === 'customers' && (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                  <th style={{padding: '12px', textAlign: 'left'}}>ID</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Name</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Email</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Phone</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Address</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(c => (
                  <tr key={c.id} style={{borderBottom: '1px solid #dee2e6'}}>
                    <td style={{padding: '12px'}}>{c.id}</td>
                    <td style={{padding: '12px', fontWeight: '500'}}>{c.name}</td>
                    <td style={{padding: '12px'}}>{c.email}</td>
                    <td style={{padding: '12px'}}>{c.phone || '-'}</td>
                    <td style={{padding: '12px'}}>{c.address || '-'}</td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <button onClick={() => deleteItem('customer', c.id)} style={{background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer'}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Table */}
        {activeTab === 'orders' && (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f8f9fa', borderBottom: '2px solid #dee2e6'}}>
                  <th style={{padding: '12px', textAlign: 'left'}}>Order ID</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Customer</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Product</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Qty</th>
                  <th style={{padding: '12px', textAlign: 'right'}}>Total</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Date</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Status</th>
                  <th style={{padding: '12px', textAlign: 'center'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{borderBottom: '1px solid #dee2e6'}}>
                    <td style={{padding: '12px'}}>#{o.id}</td>
                    <td style={{padding: '12px'}}>{o.customerEmail}</td>
                    <td style={{padding: '12px'}}>{o.productName}</td>
                    <td style={{padding: '12px', textAlign: 'center'}}>{o.quantity}</td>
                    <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#28a745'}}>${o.total}</td>
                    <td style={{padding: '12px', textAlign: 'center'}}>{o.date}</td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <span style={{background: o.status === 'delivered' ? '#28a745' : o.status === 'shipped' ? '#17a2b8' : '#ffc107', padding: '4px 8px', borderRadius: '4px', color: 'white', fontSize: '12px'}}>{o.status}</span>
                    </td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <button onClick={() => deleteItem('order', o.id)} style={{background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer'}}>Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div style={{background: 'white', padding: '30px', borderRadius: '10px', width: '500px', maxWidth: '90%'}}>
            <h2>Add {modalType}</h2>
            {modalType === 'product' && (
              <>
                <input placeholder="SKU *" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <input placeholder="Name *" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <input placeholder="Price *" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <input placeholder="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <input placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <button onClick={addProduct} style={{width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px'}}>Save</button>
              </>
            )}
            {modalType === 'customer' && (
              <>
                <input placeholder="Name *" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <input placeholder="Email *" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <input placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <textarea placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} rows="3" />
                <button onClick={addCustomer} style={{width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px'}}>Save</button>
              </>
            )}
            {modalType === 'order' && (
              <>
                <select value={newOrder.customerEmail} onChange={e => setNewOrder({...newOrder, customerEmail: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.email}>{c.name} ({c.email})</option>)}
                </select>
                <select value={newOrder.productId} onChange={e => setNewOrder({...newOrder, productId: e.target.value})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}}>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price} (Stock: {p.stock})</option>)}
                </select>
                <input type="number" placeholder="Quantity" value={newOrder.quantity} onChange={e => setNewOrder({...newOrder, quantity: parseInt(e.target.value)})} style={{width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px'}} />
                <button onClick={placeOrder} style={{width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px'}}>Place Order</button>
              </>
            )}
            <button onClick={() => setShowModal(false)} style={{width: '100%', padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px'}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;