package com.zyeteam.official

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import rikka.shizuku.Shizuku

class MainActivity : AppCompatActivity() {

    private var webView: WebView? = null
    private val SHIZUKU_REQUEST_CODE = 1001

    // Listener saat user kasih/deny izin Shizuku
    private val permissionListener = Shizuku.OnRequestPermissionResultListener { requestCode, grantResult ->
        if (requestCode == SHIZUKU_REQUEST_CODE) {
            val granted = grantResult == PackageManager.PERMISSION_GRANTED
            runOnUiThread {
                webView?.evaluateJavascript(
                    "onShizukuPermissionResult($granted)",
                    null
                )
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        setContentView(webView)

        val s = webView!!.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.allowFileAccess = true
        s.allowContentAccess = true
        s.mediaPlaybackRequiresUserGesture = false
        s.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        webView!!.webChromeClient = WebChromeClient()
        webView!!.webViewClient = WebViewClient()
        webView!!.addJavascriptInterface(Bridge(this), "AndroidBridge")
        webView!!.loadUrl("file:///android_asset/index.html")

        // Register listener Shizuku
        try {
            Shizuku.addRequestPermissionResultListener(permissionListener)
        } catch (e: Throwable) {
            // Shizuku belum terinstall — diamkan
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            Shizuku.removeRequestPermissionResultListener(permissionListener)
        } catch (e: Throwable) {}
    }

    override fun onBackPressed() {
        val wv = webView
        if (wv != null && wv.canGoBack()) wv.goBack() else super.onBackPressed()
    }

    inner class Bridge(private val ctx: Context) {

        /* ============ CEK SHIZUKU INSTALL ============ */
        @JavascriptInterface
        fun isShizukuInstalled(): Boolean {
            return try {
                ctx.packageManager.getPackageInfo("moe.shizuku.privileged.api", 0)
                true
            } catch (e: PackageManager.NameNotFoundException) {
                false
            }
        }

        /* ============ CEK SHIZUKU RUNNING ============ */
        @JavascriptInterface
        fun isShizukuRunning(): Boolean {
            return try {
                Shizuku.pingBinder()
            } catch (e: Throwable) {
                false
            }
        }

        /* ============ CEK IZIN SHIZUKU ============ */
        @JavascriptInterface
        fun checkShizukuPermission(): Boolean {
            return try {
                if (!Shizuku.pingBinder()) return false
                Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
            } catch (e: Throwable) {
                false
            }
        }

        /* ============ REQUEST IZIN SHIZUKU ============ */
        @JavascriptInterface
        fun requestShizukuPermission(): String {
            return try {
                if (!Shizuku.pingBinder()) {
                    return "NOT_RUNNING"
                }
                if (Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) {
                    return "ALREADY_GRANTED"
                }
                // Request — akan muncul popup Shizuku
                runOnUiThread {
                    Shizuku.requestPermission(SHIZUKU_REQUEST_CODE)
                }
                "REQUESTING"
            } catch (e: Throwable) {
                "ERROR"
            }
        }

        /* ============ BUKA APP SHIZUKU / PLAY STORE ============ */
        @JavascriptInterface
        fun openShizukuApp() {
            try {
                val intent = ctx.packageManager.getLaunchIntentForPackage("moe.shizuku.privileged.api")
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    ctx.startActivity(intent)
                } else {
                    // Belum install → ke Play Store
                    val playIntent = Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("https://play.google.com/store/apps/details?id=moe.shizuku.privileged.api")
                    )
                    playIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    ctx.startActivity(playIntent)
                }
            } catch (e: Exception) {
                Toast.makeText(ctx, "Gagal buka Shizuku", Toast.LENGTH_SHORT).show()
            }
        }

        /* ============ OPEN URL ============ */
        @JavascriptInterface
        fun openUrl(url: String) {
            try {
                val i = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(i)
            } catch (e: Exception) {}
        }

        /* ============ CLIPBOARD ============ */
        @JavascriptInterface
        fun getClipboard(): String {
            return try {
                val cm = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                cm.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
            } catch (e: Exception) { "" }
        }

        /* ============ LAUNCH FREE FIRE ============ */
        @JavascriptInterface
        fun launchFreeFire(): String {
            val ff = "com.dts.freefireth"
            val ffmax = "com.dts.freefiremax"
            return when {
                isInstalled(ff) -> { launchPkg(ff); "FF" }
                isInstalled(ffmax) -> { launchPkg(ffmax); "FFMAX" }
                else -> "NONE"
            }
        }

        private fun isInstalled(pkg: String): Boolean = try {
            ctx.packageManager.getPackageInfo(pkg, 0); true
        } catch (e: Exception) { false }

        private fun launchPkg(pkg: String) {
            try {
                val i = ctx.packageManager.getLaunchIntentForPackage(pkg)
                i?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(i)
            } catch (e: Exception) {}
        }
    }
}
