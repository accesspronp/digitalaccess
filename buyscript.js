let checkout = JSON.parse(localStorage.getItem('danCheckout') || '[]');
let paymentMethod = 'Khalti';

const params = new URLSearchParams(location.search);
if(params.get('product') && params.get('price')){
  checkout = [{name: params.get('product'), price: Number(params.get('price')), qty: 1}];
  localStorage.setItem('danCheckout', JSON.stringify(checkout));
}
if(!Array.isArray(checkout) || checkout.length === 0){ checkout = [{name:'Netflix Premium', price:349, qty:1}]; }

function money(n){ return 'Rs. ' + Number(n).toLocaleString(); }
function total(){ return checkout.reduce((s,i)=>s + Number(i.price)*Number(i.qty || 1), 0); }

function renderOrder(){
  document.getElementById('orderItems').innerHTML = checkout.map(i => `
    <div class="checkout-item">
      <div><strong>${i.name}</strong><p>Quantity: ${i.qty || 1}</p></div>
      <span>${money(Number(i.price) * Number(i.qty || 1))}</span>
    </div>`).join('');
  document.getElementById('subtotal').innerText = money(total());
  document.getElementById('total').innerText = money(total());
}

function showQR(type){
  const qr = document.getElementById('mainQR');
  const dl = document.getElementById('downloadQR');
  const label = document.getElementById('selectedMethod');
  paymentMethod = type === 'esewa' ? 'eSewa' : 'Khalti';
  if(type === 'esewa'){
    qr.src = 'esewa.png';
    dl.href = 'esewa.png';
    dl.download = 'DigitalAccessNepal-eSewa-QR.png';
    label.innerText = 'eSewa Selected';
  } else {
    qr.src = 'khalti.png';
    dl.href = 'khalti.png';
    dl.download = 'DigitalAccessNepal-Khalti-QR.png';
    label.innerText = 'Khalti Selected';
  }
  document.querySelectorAll('.paybtns button').forEach(b => b.classList.remove('active'));
  document.getElementById(type + 'Btn').classList.add('active');
}

function completeOrder(){
  const name = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if(!name || !phone){ alert('Please enter full name and phone number.'); return; }

  const id = 'DAN-' + Math.floor(100000 + Math.random() * 900000);
  const order = {
    id, name, phone,
    email: document.getElementById('email').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    note: document.getElementById('note').value.trim(),
    items: checkout,
    total: total(),
    payment: paymentMethod,
    status: 'Payment screenshot required / Pending verification',
    createdAt: new Date().toISOString()
  };
  const orders = JSON.parse(localStorage.getItem('danOrders') || '[]');
  orders.unshift(order);
  localStorage.setItem('danOrders', JSON.stringify(orders));
  localStorage.removeItem('danCart');

  const message = `Hello DigitalAccessNepal, I placed order ${id}. Name: ${name}. Total: Rs. ${order.total}. Payment: ${paymentMethod}.`;
  document.getElementById('waLink').href = 'https://wa.me/9779829136727?text=' + encodeURIComponent(message);
  document.getElementById('orderMessage').innerHTML = `<div class="success-box"><h3>Order Placed Successfully!</h3><p>Your Order ID is <strong>${id}</strong></p><p>Status: ${order.status}</p><a class="download-btn" href="index.html#track">Track Order</a></div>`;
  alert('Order placed! Your Order ID is ' + id + '. Send payment screenshot on WhatsApp.');
}

renderOrder();
showQR('khalti');
