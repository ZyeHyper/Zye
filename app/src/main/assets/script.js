const VALID_KEY = "ZYE-PROXY-TEAM-OFFICIAL";
const WA_PROOF  = "https://wa.me/628817789861";

const state = {
  keyValid: false,
  toggles: { aimlock:false, esp:false, bodyhs:false },
  currentProduct: null,
  timer: null,
  timeLeft: 300
};

const toastEl = document.getElementById("toast");
let toastTimer = null;
function toast(msg, ms = 2000){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toastEl.classList.remove("show"), ms);
}

function go(pageId){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if(!target) return;
  target.classList.add("active");
  window.scrollTo({ top:0, behavior:"smooth" });

  const nav = document.getElementById("bottomNav");
  if(pageId === "page-key" || pageId === "page-pay"){
    nav.classList.add("hidden");
  } else {
    nav.classList.remove("hidden");
    document.querySelectorAll(".nav-btn").forEach(b=>{
      b.classList.toggle("active", b.dataset.page === pageId);
    });
  }
  if(pageId !== "page-pay") stopPaymentTimer();
}

document.querySelectorAll(".social-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const url = btn.dataset.url;
    if(!url) return;
    openExternal(url);
  });
});

function openExternal(url){
  if(window.AndroidBridge && typeof window.AndroidBridge.openUrl === "function"){
    try { window.AndroidBridge.openUrl(url); return; } catch(e){}
  }
  const w = window.open(url, "_blank");
  if(!w) location.href = url;
}

/* KEY SYSTEM */
const keyInput   = document.getElementById("keyInput");
const pasteBtn   = document.getElementById("pasteBtn");
const validateBtn= document.getElementById("validateBtn");
const continueBtn= document.getElementById("continueBtn");
const keyStatus  = document.getElementById("keyStatus");

pasteBtn.addEventListener("click", async ()=>{
  try{
    let text = "";
    if(window.AndroidBridge && window.AndroidBridge.getClipboard){
      text = window.AndroidBridge.getClipboard();
    } else if(navigator.clipboard && navigator.clipboard.readText){
      text = await navigator.clipboard.readText();
    }
    if(!text || !text.trim()){ toast("Clipboard kosong"); return; }
    keyInput.value = text.trim();
    toast("Key ditempel");
  }catch(e){ toast("Clipboard kosong"); }
});

validateBtn.addEventListener("click", validateKey);
keyInput.addEventListener("keydown", e=>{ if(e.key === "Enter") validateKey(); });

function validateKey(){
  const v = (keyInput.value || "").trim();
  if(!v){
    keyStatus.textContent = "MASUKKAN KEY TERLEBIH DAHULU";
    keyStatus.className = "key-status invalid";
    toast("MASUKKAN KEY TERLEBIH DAHULU");
    return;
  }
  if(v === VALID_KEY){
    state.keyValid = true;
    keyStatus.textContent = "KEY VALID — UNLIMITED DEVICE";
    keyStatus.className = "key-status valid";
    continueBtn.classList.remove("hidden");
    toast("KEY VALID");
  }else{
    state.keyValid = false;
    keyStatus.textContent = "KEY INVALID";
    keyStatus.className = "key-status invalid";
    continueBtn.classList.add("hidden");
    toast("KEY INVALID");
  }
}

continueBtn.addEventListener("click", ()=>{
  if(!state.keyValid){ toast("KEY INVALID"); return; }
  go("page-home");
});

/* CONTROL PANEL */
document.querySelectorAll(".ctrl-card").forEach(card=>{
  card.addEventListener("click", ()=>{
    const key = card.dataset.key;
    state.toggles[key] = !state.toggles[key];
    const on = state.toggles[key];
    card.classList.toggle("on", on);
    card.querySelector(".ctrl-state").textContent = on ? "ON" : "OFF";
  });
});

/* LAUNCH */
document.getElementById("launchBtn").addEventListener("click", ()=>{
  if(window.AndroidBridge && typeof window.AndroidBridge.launchFreeFire === "function"){
    try{
      const result = window.AndroidBridge.launchFreeFire();
      if(result === "FF") toast("LAUNCHING FREE FIRE");
      else if(result === "FFMAX") toast("LAUNCHING FREE FIRE MAX");
      else toast("FREE FIRE TIDAK DITEMUKAN DI PERANGKAT", 2600);
    }catch(e){ toast("FREE FIRE TIDAK DITEMUKAN DI PERANGKAT"); }
  } else {
    toast("FREE FIRE TIDAK DITEMUKAN DI PERANGKAT");
  }
});

/* SHIZUKU */
const shizukuState = document.getElementById("shizukuState");
const shizukuBtn   = document.getElementById("shizukuBtn");

shizukuBtn.addEventListener("click", ()=>{
  if(window.AndroidBridge && typeof window.AndroidBridge.checkShizuku === "function"){
    try{
      const ok = window.AndroidBridge.checkShizuku();
      if(ok){
        shizukuState.textContent = "SHIZUKU CONNECTED";
        shizukuState.classList.add("on");
        toast("SHIZUKU CONNECTED");
      } else {
        shizukuState.textContent = "SHIZUKU BELUM AKTIF";
        shizukuState.classList.remove("on");
        toast("SHIZUKU BELUM AKTIF");
        if(window.AndroidBridge.requestShizuku) window.AndroidBridge.requestShizuku();
      }
    }catch(e){ toast("SHIZUKU BELUM AKTIF"); }
  } else {
    toast("SHIZUKU BELUM AKTIF");
    shizukuState.textContent = "SHIZUKU BELUM AKTIF";
  }
});

/* STORE DATA */
const STORE = [
  { cat:"📁 FILE HEADLOCK", items:[
    { name:"HEADLOCK 70%",  price:"RP 15K", desc:"Lock kepala akurasi stabil." },
    { name:"HEADLOCK 80%",  price:"RP 20K", desc:"Lock kepala lebih sticky." },
    { name:"HEADLOCK 90%",  price:"RP 25K", desc:"Headshot area besar & stabil." },
    { name:"HEADLOCK 99%",  price:"RP 30K", desc:"Max lock — hampir selalu HS." }
  ]},
  { cat:"🎯 FILE AIMLOCK", items:[
    { name:"AIMLOCK 98%",      price:"RP 20K", desc:"Aim lock cepat & halus." },
    { name:"AIMLOCK 98% VIP",  price:"RP 30K", desc:"Versi VIP, lebih presisi." }
  ]},
  { cat:"🎯 FILE AIMBOT", items:[
    { name:"AIMBOT 97%",      price:"RP 25K", desc:"Auto aim ke target terdekat." },
    { name:"AIMBOT 97% VIP",  price:"RP 35K", desc:"Versi VIP auto aim." }
  ]},
  { cat:"🔥 FILE DRAG HS", items:[
    { name:"DRAG HS 70%",  price:"RP 10K", desc:"Drag ke headshot akurasi 70%." },
    { name:"DRAG HS 80%",  price:"RP 15K", desc:"Drag ke headshot akurasi 80%." },
    { name:"DRAG HS 90%",  price:"RP 20K", desc:"Drag ke headshot akurasi 90%." },
    { name:"DRAG HS 100%", price:"RP 25K", desc:"Drag langsung headshot penuh." }
  ]},
  { cat:"📱 FILE YTTA", items:[
    { name:"GRAFIK MINICRAFT",  price:"RP 15K", desc:"Grafik ringan seperti minicraft." },
    { name:"BODY HS NON ROOT",  price:"RP 50K", desc:"Body ke headshot tanpa root." },
    { name:"MAGIC BULLET",      price:"RP 30K", desc:"Peluru menembus beberapa target." },
    { name:"BODYLOCK 100%",     price:"RP 50K", desc:"Lock badan penuh." }
  ]},
  { cat:"⚙️ MODULE — HEADTRICK HYR", items:[
    { name:"HEADTRICK HYR BASIC",         price:"10K", desc:"Modul dasar headtrick." },
    { name:"HEADTRICK HYR INTERMEDIATE",  price:"20K", desc:"Modul headtrick menengah." },
    { name:"HEADTRICK HYR SUPER PREMIUM", price:"30K", desc:"Modul headtrick premium." }
  ]},
  { cat:"⚡ MODULE — HYPER SONIC", items:[
    { name:"HYPER SONIC V1", price:"5K",  desc:"Module HS super ringan." },
    { name:"HYPER SONIC V2", price:"10K", desc:"Improve aim + stabilizer." },
    { name:"HYPER SONIC V3", price:"15K", desc:"Headshot point +1." },
    { name:"HYPER SONIC V4", price:"20K", desc:"Full stabilizer + HS." },
    { name:"HYPER SONIC V5", price:"25K", desc:"Best performance version." }
  ]},
  { cat:"🟣 DRIP CLIENT APK MOD", items:[
    { name:"DRIP CLIENT 1DAY",  price:"15K",  desc:"Paket harian." },
    { name:"DRIP CLIENT 3DAY",  price:"25K",  desc:"Paket 3 hari." },
    { name:"DRIP CLIENT 7DAY",  price:"50K",  desc:"Paket mingguan." },
    { name:"DRIP CLIENT 15DAY", price:"60K",  desc:"Paket 15 hari." },
    { name:"DRIP CLIENT 30DAY", price:"115K", desc:"Paket bulanan." }
  ]},
  { cat:"🟢 DRIP CLIENT PROXY", items:[
    { name:"DRIP PROXY 1DAY",  price:"15K", desc:"Proxy harian." },
    { name:"DRIP PROXY 3DAY",  price:"25K", desc:"Proxy 3 hari." },
    { name:"DRIP PROXY 7DAY",  price:"50K", desc:"Proxy mingguan." }
  ]},
  { cat:"🔵 HG CHEAT APK MOD", items:[
    { name:"HG CHEAT 1DAY",  price:"20K",  desc:"HG harian." },
    { name:"HG CHEAT 7DAY",  price:"40K",  desc:"HG 7 hari." },
    { name:"HG CHEAT 10DAY", price:"50K",  desc:"HG 10 hari." },
    { name:"HG CHEAT 30DAY", price:"120K", desc:"HG bulanan." }
  ]}
];

const storeList = document.getElementById("storeList");
function renderStore(){
  storeList.innerHTML = "";
  STORE.forEach(group=>{
    const cat = document.createElement("div");
    cat.className = "store-cat";
    cat.textContent = group.cat;
    storeList.appendChild(cat);

    group.items.forEach(it=>{
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="pc-head">
          <div class="pc-name">${it.name}</div>
          <div class="pc-price">${it.price}</div>
        </div>
        <div class="pc-desc">${it.desc}</div>
        <button class="pc-buy">BUY</button>
      `;
      card.querySelector(".pc-buy").addEventListener("click", ()=> openPurchaseModal(it));
      storeList.appendChild(card);
    });
  });
}
renderStore();

/* PURCHASE MODAL */
const modal         = document.getElementById("modal");
const modalName     = document.getElementById("modalName");
const modalPrice    = document.getElementById("modalPrice");
const modalContinue = document.getElementById("modalContinue");
const modalCancel   = document.getElementById("modalCancel");

function openPurchaseModal(product){
  state.currentProduct = product;
  modalName.textContent  = product.name;
  modalPrice.textContent = product.price;
  modal.classList.remove("hidden");
}
modalCancel.addEventListener("click", ()=>{
  modal.classList.add("hidden");
  state.currentProduct = null;
});
modalContinue.addEventListener("click", ()=>{
  modal.classList.add("hidden");
  if(!state.currentProduct) return;
  startPayment(state.currentProduct);
});

/* PAYMENT */
const payProductEl = document.getElementById("payProduct");
const payTimerEl   = document.getElementById("payTimer");
const payCard      = document.querySelector(".pay-card");
const paidBtn      = document.getElementById("paidBtn");
const proofBtn     = document.getElementById("proofBtn");
const backStoreBtn = document.getElementById("backStoreBtn");

function startPayment(product){
  payProductEl.textContent = `${product.name} — ${product.price}`;
  payCard.classList.remove("expired");
  paidBtn.disabled = false;  paidBtn.style.opacity = "1";
  proofBtn.disabled = false; proofBtn.style.opacity = "1";
  payTimerEl.style.fontSize = ""; payTimerEl.style.letterSpacing = "";
  state.timeLeft = 300;
  updateTimerUI();
  go("page-pay");
  startPaymentTimer();
}

function startPaymentTimer(){
  stopPaymentTimer();
  state.timer = setInterval(()=>{
    state.timeLeft--;
    updateTimerUI();
    if(state.timeLeft <= 0){ stopPaymentTimer(); expirePayment(); }
  }, 1000);
}
function stopPaymentTimer(){ if(state.timer){ clearInterval(state.timer); state.timer = null; } }
function updateTimerUI(){
  const m = Math.floor(state.timeLeft / 60);
  const s = state.timeLeft % 60;
  payTimerEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function expirePayment(){
  payCard.classList.add("expired");
  payTimerEl.textContent = "PAYMENT SESSION EXPIRED";
  payTimerEl.style.fontSize = "14px";
  payTimerEl.style.letterSpacing = "2px";
  paidBtn.disabled = true;  paidBtn.style.opacity = "0.4";
  proofBtn.disabled = true; proofBtn.style.opacity = "0.4";
  toast("PAYMENT SESSION EXPIRED", 2400);
}

paidBtn.addEventListener("click", ()=>{ if(state.timeLeft <= 0) return; toast("Silakan kirim bukti pembayaran"); });

proofBtn.addEventListener("click", ()=>{
  if(state.timeLeft <= 0) return;
  const msg = state.currentProduct
    ? `Halo Admin, saya sudah bayar:\n\nProduk: ${state.currentProduct.name}\nHarga: ${state.currentProduct.price}\n\nBerikut bukti pembayarannya.`
    : "Halo Admin, saya sudah bayar. Berikut bukti pembayarannya.";
  openExternal(`${WA_PROOF}?text=${encodeURIComponent(msg)}`);
});

backStoreBtn.addEventListener("click", ()=>{ stopPaymentTimer(); go("page-store"); });

/* NAV */
document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", ()=> go(btn.dataset.page));
});

/* VIDEO FALLBACK */
const video = document.getElementById("bgVideo");
if(video){
  video.addEventListener("error", ()=>{ document.body.style.background = "#000"; });
  const tryPlay = ()=>{ video.play().catch(()=>{}); };
  document.addEventListener("touchstart", tryPlay, { once:true });
  document.addEventListener("click", tryPlay, { once:true });
}

window.addEventListener("load", ()=> go("page-key"));
