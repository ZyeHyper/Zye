package com.zyeteam.official

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.JavascriptInterface
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private var webView: WebView? = null

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
        s.cacheMode = WebSettings.LOAD_DEFAULT
        s.loadsImagesAutomatically = true
        s.blockNetworkImage = false
        s.blockNetworkLoads = false

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            s.mediaPlaybackRequiresUserGesture = false
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            s.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        webView!!.webChromeClient = WebChromeClient()
        webView!!.webViewClient = WebViewClient()
        webView!!.addJavascriptInterface(Bridge(this), "AndroidBridge")
        webView!!.loadUrl("file:///android_asset/index.html")
    }

    override fun onBackPressed() {
        val wv = webView
        if (wv != null && wv.canGoBack()) wv.goBack() else super.onBackPressed()
    }

    inner class Bridge(private val ctx: Context) {
        @JavascriptInterface
        fun openUrl(url: String) {
            try {
                val i = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(i)
            } catch (e: Exception) {}
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
                isInstalled(ff) -> { launchPkg(ff); "FF" }
                isInstalled(ffmax) -> { launchPkg(ffmax); "FFMAX" }
                else -> "NONE"
            }
        }

        @JavascriptInterface
        fun checkShizuku(): Boolean = false

        @JavascriptInterface
        fun requestShizuku() {}

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
