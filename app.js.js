import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// إعدادات Firebase (استخدم بياناتك الحقيقية هنا)
const firebaseConfig = {
  apiKey: "AIzaSyCWhZXcogrux881isvdYdIOhk_aaeJP3fc",
  authDomain: "al-dhibani-store.firebaseapp.com",
  projectId: "al-dhibani-store",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let products = [];

// تحميل المنتجات فور تشغيل الصفحة
async function loadProducts() {
  const container = document.getElementById("products");
  container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">جاري جلب المنتجات...</div>`;
  
  try {
    const snap = await getDocs(collection(db, "products"));
    products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    render(products);
  } catch (error) {
    container.innerHTML = `<div class="col-span-full text-center text-red-500">تأكد من إعدادات Firebase Storage و Firestore</div>`;
  }
}

// عرض المنتجات بتصميم CSS المحدث
function render(list) {
  const container = document.getElementById("products");
  container.innerHTML = "";
  
  if(list.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center text-gray-400">لا توجد منتجات مطابقة للبحث</p>`;
    return;
  }

  list.forEach(p => {
    container.innerHTML += `
      <div class="product-card p-3 flex flex-col h-full">
        <img src="${p.image}" class="h-40 w-full object-cover rounded-2xl mb-3 shadow-sm">
        <h3 class="font-bold text-gray-800 text-sm md:text-base line-clamp-1">${p.name}</h3>
        <div class="mt-auto">
          <p class="text-blue-600 font-bold my-2">${p.price} ريال</p>
          <button onclick='addToCart(${JSON.stringify(p)})'
            class="bg-blue-600 hover:bg-black text-white w-full py-2 rounded-xl transition-all text-sm font-bold shadow-md active:scale-95">
            <i class="fas fa-plus ml-1"></i> أضف للسلة
          </button>
        </div>
      </div>
    `;
  });
}

// وظيفة البحث المرتبطة بالزر
window.search = function() {
  const v = document.getElementById("search").value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(v));
  render(filtered);
};

// إدارة السلة
window.addToCart = function(p) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let item = cart.find(i => i.id === p.id);

  if (item) { item.qty++; } 
  else { cart.push({ ...p, qty: 1 }); }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  
  // تنبيه بسيط عند الإضافة
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.innerHTML = "تمت الإضافة! ✅";
  setTimeout(() => btn.innerHTML = originalText, 1000);
};

function updateCartUI() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items-container");
  const footer = document.getElementById("cart-footer");
  const count = document.getElementById("cart-count");

  count.innerText = cart.reduce((s, i) => s + i.qty, 0);

  if (cart.length === 0) {
    container.innerHTML = `<div class="text-center py-20 text-gray-400"><i class="fas fa-ghost text-4xl mb-2"></i><p>السلة فارغة</p></div>`;
    footer.innerHTML = "";
    return;
  }

  let total = 0;
  container.innerHTML = cart.map((p, index) => {
    total += p.price * p.qty;
    return `
      <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
        <img src="${p.image}" class="w-14 h-14 object-cover rounded-lg">
        <div class="flex-1">
          <h4 class="font-bold text-xs line-clamp-1">${p.name}</h4>
          <p class="text-blue-600 font-bold text-xs">${p.price} ريال</p>
          <div class="flex items-center gap-3 mt-1">
            <button onclick="changeQty(${index}, -1)" class="w-6 h-6 bg-white border rounded shadow-sm">-</button>
            <span class="text-xs font-bold">${p.qty}</span>
            <button onclick="changeQty(${index}, 1)" class="w-6 h-6 bg-white border rounded shadow-sm">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  footer.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <span class="text-gray-500">إجمالي الطلب:</span>
      <span class="text-xl font-bold text-blue-600">${total} ريال</span>
    </div>
    <button onclick="sendOrder()" class="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2">
      <i class="fab fa-whatsapp text-xl"></i> إرسال الطلب الآن
    </button>
  `;
}

window.changeQty = function(i, v) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[i].qty += v;
  if(cart[i].qty <= 0) cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
};

// إرسال الطلب وتصفير السلة
window.sendOrder = function() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return;

  let msg = "🛒 *طلب جديد من متجر الذيباني*%0A%0A";
  let total = 0;
  cart.forEach(p => {
    msg += `• *${p.name}* (${p.qty} حبة) = ${p.price * p.qty} ريال%0A`;
    total += p.price * p.qty;
  });
  msg += `%0A💰 *الإجمالي: ${total} ريال*`;

  window.open(`https://wa.me/967770493341?text=${msg}`, "_blank");

  // --- تصفير السلة بعد تقديم الطلب ---
  localStorage.removeItem("cart");
  updateCartUI();
  toggleCart(); // إغلاق نافذة السلة
};

// السلايدر
const slides = ["ad1.jpg", "ad2.jpg", "ad3.jpg"];
let idx = 0;
function startSlider() {
  const img = document.getElementById("sliderImg");
  if(!img) return;
  setInterval(() => {
    img.style.opacity = 0;
    setTimeout(() => {
      img.src = slides[idx];
      img.style.opacity = 1;
      idx = (idx + 1) % slides.length;
    }, 500);
  }, 4000);
}

// التشغيل الابتدائي
loadProducts();
updateCartUI();
startSlider();