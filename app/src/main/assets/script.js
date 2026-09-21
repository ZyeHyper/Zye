/* ============================================================
   ZYE TEAM OFFICIAL - Core Logic (SECURED)
   ============================================================ */

/* ============ SECURITY LAYER ============ */
const _h1 = "49541a466706dff8";
const _h2 = "70bae61911081749";
const _h3 = "8e47f27d8ac6f225";
const _h4 = "7bf64606b689c1da";

async function hashSHA256(str){
  try{
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
      .map(function(b){ return b.toString(16).padStart(2, "0"); })
      .join("");
  }catch(e){
    return "";
  }
}

function assembleHash(){
  return _h1 + _h2 + _h3 + _h4;
}

async function isKeyValid(input){
  if(!input || !input.trim()) return false;
  const normalized = input.trim().toUpperCase().replace(/\s+/g, "");
  const userHash = await hashSHA256(normalized);
  const expectedHash = assembleHash();
  return userHash === expectedHash;
}

/* ============ STATE ============ */
const WA_PROOF = "https://wa.me/628817789861";
const GET_KEY_URL = "https://get-key-proxy.vercel.app/";

const state = {
  keyValid: false,
  toggles: { aimlock:false, esp:false, bodyhs:false },
  currentProduct: null,
  timer: null,
  timeLeft: 300
};

/* ============ TOAST ============ */
let toastTimer = null;
function toast(msg, ms){
  if(ms === undefined) ms = 2000;
  const toastEl = document.getElementById("toast");
  if(!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toastEl.classList.remove("show"); }, ms);
}

/* ============ NAVIGASI ============ */
function go(pageId){
  document.querySelectorAll(".page").forEach(function(p){ p.classList.remove("active"); });
  const target = document.getElementById(pageId);
  if(!target) return;
  target.classList.add("active");
  window.scrollTo({ top:0, behavior:"smooth" });

  const nav = document.getElementById("bottomNav");
  if(!nav) return;
  if(pageId === "page-key" || pageId === "page-pay"){
    nav.classList.add("hidden");
  } else {
    nav.classList.remove("hidden");
    document.querySelectorAll(".nav-btn").forEach(function(b){
      b.classList.toggle("active", b.dataset.page === pageId);
    });
  }
  if(pageId !== "page-pay") stopPaymentTimer();
  if(pageId === "page-home") setTimeout(updateShizukuUI, 200);
}

/* ============ OPEN EXTERNAL ============ */
function openExternal(url){
  if(window.AndroidBridge && typeof window.AndroidBridge.openUrl === "function"){
    try { window.AndroidBridge.openUrl(url); return; } catch(e){}
  }
  const w = window.open(url, "_blank");
  if(!w) location.href = url;
}

/* ============ KEY SYSTEM ============ */
function initKeySystem(){
  const keyInput = document.getElementById("keyInput");
  const pasteBtn = document.getElementById("pasteBtn");
  const validateBtn = document.getElementById("validateBtn");
  const continueBtn = document.getElementById("continueBtn");
  const keyStatus = document.getElementById("keyStatus");
  const getKeyBtn = document.getElementById("getKeyBtn");

  if(!keyInput || !validateBtn) return;

  async function validateKey(){
    const v = (keyInput.value || "").trim();

    if(!v){
      keyStatus.textContent = "MASUKKAN KEY TERLEBIH DAHULU";
      keyStatus.className = "key-status invalid";
      toast("MASUKKAN KEY TERLEBIH DAHULU");
      return;
    }

    const valid = await isKeyValid(v);

    if(valid){
      state.keyValid = true;
      keyStatus.textContent = "KEY VALID — UNLIMITED DEVICE";
      keyStatus.className = "key-status valid";
      continueBtn.classList.remove("hidden");
      toast("KEY VALID");
    } else {
      state.keyValid = false;
      keyStatus.textContent = "KEY INVALID";
      keyStatus.className = "key-status invalid";
      continueBtn.classList.add("hidden");
      toast("KEY INVALID");
    }
  }

  validateBtn.addEventListener("click", validateKey);

  keyInput.addEventListener("keydown", function(e){
    if(e.key === "Enter") validateKey();
  });

  if(pasteBtn){
    pasteBtn.addEventListener("click", function(){
      try{
        if(window.AndroidBridge && window.AndroidBridge.getClipboard){
          const text = window.AndroidBridge.getClipboard();
          if(!text || !text.trim()){ toast("Clipboard kosong"); return; }
          keyInput.value = text.trim();
          toast("Key ditempel");
        } else if(navigator.clipboard && navigator.clipboard.readText){
          navigator.clipboard.readText().then(function(t){
            if(!t || !t.trim()){ toast("Clipboard kosong"); return; }
            keyInput.value = t.trim();
            toast("Key ditempel");
          });
        } else {
          toast("Clipboard tidak tersedia");
        }
      }catch(e){ toast("Clipboard kosong"); }
    });
  }

  if(continueBtn){
    continueBtn.addEventListener("click", function(){
      if(!state.keyValid){ toast("KEY INVALID"); return; }
      go("page-home");
    });
  }

  /* GET KEY BUTTON */
  if(getKeyBtn){
    getKeyBtn.addEventListener("click", function(){
      openExternal(GET_KEY_URL);
    });
  }
}

/* ============ SOCIAL ============ */
function initSocialButtons(){
  document.querySelectorAll(".social-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      const url = btn.dataset.url;
      if(!url) return;
      openExternal(url);
    });
  });
}

/* ============ TOGGLES ============ */
function initToggles(){
  document.querySelectorAll(".ctrl-card").forEach(function(card){
    card.addEventListener("click", function(){
      const key = card.dataset.key;
      state.toggles[key] = !state.toggles[key];
      const on = state.toggles[key];
      card.classList.toggle("on", on);
      const stateEl = card.querySelector(".ctrl-state");
      if(stateEl) stateEl.textContent = on ? "ON" : "OFF";
    });
  });
}

/* ============ LAUNCH ============ */
function initLaunch(){
  const launchBtn = document.getElementById("launchBtn");
  if(!launchBtn) return;
  launchBtn.addEventListener("click", function(){
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
}

/* ============ SHIZUKU ============ */
function updateShizukuUI(){
  const statusEl = document.getElementById("shizukuState");
  if(!statusEl) return;

  if(!window.AndroidBridge || !window.AndroidBridge.isShizukuInstalled){
    statusEl.textContent = "NOT AVAILABLE";
    statusEl.classList.remove("on");
    return;
  }
  if(!window.AndroidBridge.isShizukuInstalled()){
    statusEl.textContent = "BELUM INSTALL";
    statusEl.classList.remove("on");
    return;
  }
  if(!window.AndroidBridge.isShizukuRunning()){
    statusEl.textContent = "BELUM AKTIF";
    statusEl.classList.remove("on");
    return;
  }
  if(window.AndroidBridge.checkShizukuPermission()){
    statusEl.textContent = "CONNECTED ✓";
    statusEl.classList.add("on");
  } else {
    statusEl.textContent = "BELUM DIIZINKAN";
    statusEl.classList.remove("on");
  }
}

window.onShizukuPermissionResult = function(granted){
  if(granted){ toast("SHIZUKU CONNECTED ✓"); }
  else { toast("IZIN SHIZUKU DITOLAK"); }
  updateShizukuUI();
};

function initShizuku(){
  const shizukuBtn = document.getElementById("shizukuBtn");
  if(!shizukuBtn) return;
  shizukuBtn.addEventListener("click", function(){
    if(!window.AndroidBridge || !window.AndroidBridge.isShizukuInstalled){
      toast("FITUR INI HANYA DI APK");
      return;
    }
    if(!window.AndroidBridge.isShizukuInstalled()){
      toast("SHIZUKU BELUM DIINSTALL");
      if(window.AndroidBridge.openShizukuApp) window.AndroidBridge.openShizukuApp();
      return;
    }
    if(!window.AndroidBridge.isShizukuRunning()){
      toast("BUKA SHIZUKU & AKTIFKAN DULU");
      if(window.AndroidBridge.openShizukuApp) window.AndroidBridge.openShizukuApp();
      return;
    }
    const result = window.AndroidBridge.requestShizukuPermission();
    if(result === "ALREADY_GRANTED"){
      toast("SHIZUKU SUDAH AKTIF ✓");
      updateShizukuUI();
    } else if(result === "REQUESTING"){
      toast("MENUNGGU IZIN SHIZUKU...");
    } else if(result === "NOT_RUNNING"){
      toast("SHIZUKU BELUM AKTIF");
      if(window.AndroidBridge.openShizukuApp) window.AndroidBridge.openShizukuApp();
    } else {
      toast("GAGAL REQUEST IZIN");
    }
  });
}

/* ============ STORE DATA ============ */
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

function renderStore(){
  const storeList = document.getElementById("storeList");
  if(!storeList) return;
  storeList.innerHTML = "";
  STORE.forEach(function(group){
    const cat = document.createElement("div");
    cat.className = "store-cat";
    cat.textContent = group.cat;
    storeList.appendChild(cat);

    group.items.forEach(function(it){
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML =
        '<div class="pc-head">' +
          '<div class="pc-name">' + it.name + '</div>' +
          '<div class="pc-price">' + it.price + '</div>' +
        '</div>' +
        '<div class="pc-desc">' + it.desc + '</div>' +
        '<button class="pc-buy">BUY</button>';
      card.querySelector(".pc-buy").addEventListener("click", function(){
        openPurchaseModal(it);
      });
      storeList.appendChild(card);
    });
  });
}

/* ============ MODAL ============ */
function openPurchaseModal(product){
  state.currentProduct = product;
  const modal = document.getElementById("modal");
  const modalName = document.getElementById("modalName");
  const modalPrice = document.getElementById("modalPrice");
  if(modalName) modalName.textContent = product.name;
  if(modalPrice) modalPrice.textContent = product.price;
  if(modal) modal.classList.remove("hidden");
}

function initModal(){
  const modal = document.getElementById("modal");
  const modalContinue = document.getElementById("modalContinue");
  const modalCancel = document.getElementById("modalCancel");

  if(modalCancel){
    modalCancel.addEventListener("click", function(){
      if(modal) modal.classList.add("hidden");
      state.currentProduct = null;
    });
  }
  if(modalContinue){
    modalContinue.addEventListener("click", function(){
      if(modal) modal.classList.add("hidden");
      if(!state.currentProduct) return;
      startPayment(state.currentProduct);
    });
  }
}

/* ============ PAYMENT ============ */
function startPayment(product){
  const payProductEl = document.getElementById("payProduct");
  const payCard = document.querySelector(".pay-card");
  const paidBtn = document.getElementById("paidBtn");
  const proofBtn = document.getElementById("proofBtn");
  const payTimerEl = document.getElementById("payTimer");

  if(payProductEl) payProductEl.textContent = product.name + " — " + product.price;
  if(payCard) payCard.classList.remove("expired");
  if(paidBtn){ paidBtn.disabled = false; paidBtn.style.opacity = "1"; }
  if(proofBtn){ proofBtn.disabled = false; proofBtn.style.opacity = "1"; }
  if(payTimerEl){ payTimerEl.style.fontSize = ""; payTimerEl.style.letterSpacing = ""; }

  state.timeLeft = 300;
  updateTimerUI();
  go("page-pay");
  startPaymentTimer();
}

function startPaymentTimer(){
  stopPaymentTimer();
  state.timer = setInterval(function(){
    state.timeLeft--;
    updateTimerUI();
    if(state.timeLeft <= 0){ stopPaymentTimer(); expirePayment(); }
  }, 1000);
}

function stopPaymentTimer(){
  if(state.timer){ clearInterval(state.timer); state.timer = null; }
}

function updateTimerUI(){
  const payTimerEl = document.getElementById("payTimer");
  if(!payTimerEl) return;
  const m = Math.floor(state.timeLeft / 60);
  const s = state.timeLeft % 60;
  payTimerEl.textContent = String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");
}

function expirePayment(){
  const payCard = document.querySelector(".pay-card");
  const payTimerEl = document.getElementById("payTimer");
  const paidBtn = document.getElementById("paidBtn");
  const proofBtn = document.getElementById("proofBtn");

  if(payCard) payCard.classList.add("expired");
  if(payTimerEl){
    payTimerEl.textContent = "PAYMENT SESSION EXPIRED";
    payTimerEl.style.fontSize = "14px";
    payTimerEl.style.letterSpacing = "2px";
  }
  if(paidBtn){ paidBtn.disabled = true; paidBtn.style.opacity = "0.4"; }
  if(proofBtn){ proofBtn.disabled = true; proofBtn.style.opacity = "0.4"; }
  toast("PAYMENT SESSION EXPIRED", 2400);
}

function initPaymentButtons(){
  const paidBtn = document.getElementById("paidBtn");
  const proofBtn = document.getElementById("proofBtn");
  const backStoreBtn = document.getElementById("backStoreBtn");

  if(paidBtn){
    paidBtn.addEventListener("click", function(){
      if(state.timeLeft <= 0) return;
      toast("Silakan kirim bukti pembayaran");
    });
  }
  if(proofBtn){
    proofBtn.addEventListener("click", function(){
      if(state.timeLeft <= 0) return;
      let msg;
      if(state.currentProduct){
        msg = "Halo Admin, saya sudah bayar:\n\nProduk: " + state.currentProduct.name + "\nHarga: " + state.currentProduct.price + "\n\nBerikut bukti pembayarannya.";
      } else {
        msg = "Halo Admin, saya sudah bayar. Berikut bukti pembayarannya.";
      }
      openExternal(WA_PROOF + "?text=" + encodeURIComponent(msg));
    });
  }
  if(backStoreBtn){
    backStoreBtn.addEventListener("click", function(){
      stopPaymentTimer();
      go("page-store");
    });
  }
}

/* ============ BOTTOM NAV ============ */
function initBottomNav(){
  document.querySelectorAll(".nav-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      go(btn.dataset.page);
    });
  });
}

/* ============ VIDEO ============ */
function initVideo(){
  const video = document.getElementById("bgVideo");
  if(!video) return;
  video.muted = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  const tryPlay = function(){
    const p = video.play();
    if(p !== undefined) p.catch(function(){});
  };
  tryPlay();
  video.addEventListener("loadeddata", tryPlay);
  video.addEventListener("canplay", tryPlay);
  document.addEventListener("touchstart", tryPlay);
  document.addEventListener("click", tryPlay);
  setInterval(tryPlay, 3000);
}

/* ============ INIT ============ */
window.addEventListener("load", function(){
  try { initKeySystem(); } catch(e){ console.log("initKeySystem:", e); }
  try { initSocialButtons(); } catch(e){ console.log("initSocial:", e); }
  try { initToggles(); } catch(e){ console.log("initToggles:", e); }
  try { initLaunch(); } catch(e){ console.log("initLaunch:", e); }
  try { initShizuku(); } catch(e){ console.log("initShizuku:", e); }
  try { renderStore(); } catch(e){ console.log("renderStore:", e); }
  try { initModal(); } catch(e){ console.log("initModal:", e); }
  try { initPaymentButtons(); } catch(e){ console.log("initPayment:", e); }
  try { initBottomNav(); } catch(e){ console.log("initBottomNav:", e); }
  try { initVideo(); } catch(e){ console.log("initVideo:", e); }
  try { go("page-key"); } catch(e){ console.log("go:", e); }
  console.log("ZYE TEAM OFFICIAL - Loaded (Secured)");
});
