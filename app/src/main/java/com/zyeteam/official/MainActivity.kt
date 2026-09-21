package com.zyeteam.official

import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        setContentView(webView)

        val s: WebSettings = webView.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.databaseEnabled = true
        s.mediaPlaybackRequiresUserGesture = false
        s.loadsImagesAutomatically = true
        s.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        s.cacheMode = WebSettings.LOAD_DEFAULT
        s.allowFileAccess = true
        s.allowContentAccess = true

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                url ?: return false
                return if (url.startsWith("http")) {
                    try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))); true }
                    catch (e: Exception) { false }
                } else false
            }
        }

        webView.addJavascriptInterface(Bridge(this), "AndroidBridge")
        webView.loadUrl("file:///android_asset/index.html")
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }

    inner class Bridge(private val ctx: Context) {

        @JavascriptInterface
        fun openUrl(url: String) {
            try {
                val i = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(i)
            } catch (e: Exception) {
                Toast.makeText(ctx, "Tidak bisa membuka link", Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun getClipboard(): String {
            return try {
                val cm = ctx.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                cm.primaryClip?.getItemAt(0)?.text?.toString() ?: ""
            } catch (e: Exception) { "" }
        }

        @JavascriptInterface
        fun launchFreeFire(): String {
            val ff = "com.dts.freefireth"
            val ffmax = "com.dts.freefiremax"
            return when {
                isInstalled(ff) -> { launchPackage(ff); "FF" }
                isInstalled(ffmax) -> { launchPackage(ffmax); "FFMAX" }
                else -> "NONE"
            }
        }

        @JavascriptInterface
        fun checkShizuku(): Boolean {
            return try {
                val clazz = Class.forName("rikka.shizuku.Shizuku")
                val m = clazz.getMethod("pingBinder")
                m.invoke(null) as Boolean
            } catch (e: Throwable) { false }
        }

        @JavascriptInterface
        fun requestShizuku() {
            try {
                val clazz = Class.forName("rikka.shizuku.Shizuku")
                val m = clazz.getMethod("requestPermission", Int::class.javaPrimitiveType)
                m.invoke(null, 0)
            } catch (e: Throwable) { }
        }

        private fun isInstalled(pkg: String): Boolean = try {
            ctx.packageManager.getPackageInfo(pkg, 0); true
        } catch (e: Exception) { false }

        private fun launchPackage(pkg: String) {
            try {
                val i = ctx.packageManager.getLaunchIntentForPackage(pkg)
                i?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(i)
            } catch (e: Exception) {
                Toast.makeText(ctx, "Gagal membuka aplikasi", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
