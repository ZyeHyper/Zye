/* ============ SHIZUKU FUNCTIONS ============ */

// Update status Shizuku ke UI
function updateShizukuUI() {
  const statusEl = document.getElementById("shizukuState");
  if(!statusEl) return;
  
  if(!window.AndroidBridge || !window.AndroidBridge.isShizukuInstalled){
    statusEl.textContent = "NOT AVAILABLE";
    return;
  }
  
  // Cek install
  if(!window.AndroidBridge.isShizukuInstalled()){
    statusEl.textContent = "BELUM INSTALL";
    statusEl.classList.remove("on");
    return;
  }
  
  // Cek running
  if(!window.AndroidBridge.isShizukuRunning()){
    statusEl.textContent = "BELUM AKTIF";
    statusEl.classList.remove("on");
    return;
  }
  
  // Cek izin
  if(window.AndroidBridge.checkShizukuPermission()){
    statusEl.textContent = "CONNECTED ✓";
    statusEl.classList.add("on");
  } else {
    statusEl.textContent = "BELUM DIIZINKAN";
    statusEl.classList.remove("on");
  }
}

// Dipanggil dari Android saat user approve/deny
window.onShizukuPermissionResult = function(granted) {
  if(granted){
    toast("SHIZUKU CONNECTED ✓");
  } else {
    toast("IZIN SHIZUKU DITOLAK");
  }
  updateShizukuUI();
};
