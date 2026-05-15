import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCWhZXcogrux881isvdYdIOhk_aaeJP3fc",
  authDomain: "al-dhibani-store.firebaseapp.com",
  projectId: "al-dhibani-store",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let products = [];

/* =========================
   منتجات احتياطية (Fallback)
========================= */
const fallbackProducts = [
  {
    id: "1",
    name: "هاتف تجريبي",
    price: 50000,
    image: "https://via.placeholder.com/300"
  },
  {
    id: "2",
    name: "سماعات تجريبية",
    price: 15000,
    image: "https://via.placeholder.com/300"
  }
];

/* =========================
   تحميل المنتجات (آمن)
========================= */
async function loadProducts() {
  const container = document.getElementById("products");

  if (!container) return;

  container.innerHTML = `
    <div class="col-span-full text-center py-10 text-gray-500">
      جاري تحميل المنتجات...
    </div>
  `;

  try {
    const snap = await getDocs(collection(db, "products"));

    products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (products.length === 0) {
      products = fallbackProducts;
    }

    render(products);

  } catch (error) {
    console.error("Firebase Error:", error);

    products = fallbackProducts;

    render(products);

    container.insertAdjacentHTML("afterbegin", `
      <div class="col-span-full text-center text-red-500 mb-4">
        تم تشغيل الوضع الاحتياطي (بدون Firebase)
      </div>
    `);
  }
}

/* =========================
   عرض المنتجات
========================= */
function render(list) {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML = `
      <p class="col-span-full text-center text-gray-400">
        لا توجد منتجات
      </p>`;
    return;
  }

  list.forEach(p => {
    container.innerHTML += `
      <div class="product-card p-3 flex flex-col h-full">
        <img src="${p.image}" class="h-40 w-full object-cover rounded-2xl mb-3">
        <h3 class="font-bold text-sm">${p.name}</h3>
        <p class="text-blue-600 font-bold my-2">${p.price} ريال</p>

        <button onclick='addToCart(${JSON.stringify(p)})'
          class="bg-blue-600 text-white w-full py-2 rounded-xl">
          إضافة للسلة
        </button>
      </div>
    `;
  });
}

/* =========================
   البحث
========================= */
window.search = function () {
  const input = document.getElementById("search");
  if (!input) return;

  const value = input.value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(value)
  );

  render(filtered);
};

/* =========================
   السلة (آمنة)
========================= */
window.addToCart = function (p) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let item = cart.find(i => i.id === p.id);

  if (item) item.qty++;
  else cart.push({ ...p, qty: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
};

function updateCartUI() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const count = document.getElementById("cart-count");
  const container = document.getElementById("cart-items-container");
  const footer = document.getElementById("cart-footer");

  if (count)
    count.innerText = cart.reduce((s, i) => s + i.qty, 0);

  if (!container || !footer) return;

  if (cart.length === 0) {
    container.innerHTML = "<p class='text-center text-gray-400'>السلة فارغة</p>";
    footer.innerHTML = "";
    return;
  }

  let total = 0;

  container.innerHTML = cart.map((p, i) => {
    total += p.price * p.qty;

    return `
      <div class="p-2 border rounded">
        <p class="font-bold">${p.name}</p>
        <p>${p.qty} × ${p.price}</p>
      </div>
    `;
  }).join("");

  footer.innerHTML = `
    <div class="font-bold mb-2">الإجمالي: ${total} ريال</div>
    <button onclick="sendOrder()" class="bg-green-500 text-white w-full py-3 rounded">
      إرسال الطلب
    </button>
  `;
}

window.changeQty = function (i, v) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart[i].qty += v;

  if (cart[i].qty <= 0) cart.splice(i, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartUI();
};

/* =========================
   إرسال الطلب
========================= */
window.sendOrder = function () {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) return;

  let msg = "طلب جديد:%0A";
  let total = 0;

  cart.forEach(p => {
    msg += `${p.name} - ${p.qty} × ${p.price}%0A`;
    total += p.price * p.qty;
  });

  msg += `%0Aالإجمالي: ${total}`;

  window.open(`https://wa.me/967770493341?text=${msg}`, "_blank");

  localStorage.removeItem("cart");
  updateCartUI();
};

/* =========================
   سلايدر آمن
========================= */
const slides = ["ad1.jpg", "ad2.jpg", "ad3.jpg"];

function startSlider() {
  const img = document.getElementById("sliderImg");
  if (!img) return;

  let i = 0;

  setInterval(() => {
    img.style.opacity = 0;

    setTimeout(() => {
      img.src = slides[i];
      img.style.opacity = 1;
      i = (i + 1) % slides.length;
    }, 500);
  }, 4000);
}

/* =========================
   تشغيل آمن
========================= */
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  updateCartUI();
  startSlider();
});
