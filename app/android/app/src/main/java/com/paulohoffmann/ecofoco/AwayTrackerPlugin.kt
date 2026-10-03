package com.paulohoffmann.ecofoco

import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.PowerManager
import android.os.SystemClock
import androidx.core.content.ContextCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Measures how long the user spends in other apps — screen on and unlocked — while EcoFoco
 * is in the background. Screen-off and lock-screen time never count, so pressing the power
 * button or an auto-lock doesn't look like leaving the app. The focus rules live in the web layer.
 */
@CapacitorPlugin(name = "AwayTracker")
class AwayTrackerPlugin : Plugin() {
    private val lock = Any()
    private var paused = false
    private var otherAppMs = 0L
    private var otherAppSince: Long? = null

    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            synchronized(lock) {
                when (intent.action) {
                    Intent.ACTION_SCREEN_OFF -> stopCounting()
                    // Unlocked while we're still in the background: the user is now in another app.
                    Intent.ACTION_USER_PRESENT -> if (paused) startCounting()
                }
            }
        }
    }

    override fun load() {
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_USER_PRESENT)
        }
        ContextCompat.registerReceiver(context, screenReceiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED)
    }

    override fun handleOnPause() {
        synchronized(lock) {
            paused = true
            otherAppMs = 0L
            otherAppSince = null
            // If the power button raced ahead of SCREEN_OFF, the receiver stops this within milliseconds.
            if (isScreenInUse()) startCounting()
        }
    }

    override fun handleOnResume() {
        synchronized(lock) {
            paused = false
            stopCounting()
        }
    }

    override fun handleOnDestroy() {
        context.unregisterReceiver(screenReceiver)
    }

    /** Time in other apps during the current background period, or the latest one once back in the app. */
    @PluginMethod
    fun getOtherAppTime(call: PluginCall) {
        val ms = synchronized(lock) {
            otherAppMs + (otherAppSince?.let { SystemClock.elapsedRealtime() - it } ?: 0L)
        }
        call.resolve(JSObject().apply { put("otherAppMs", ms) })
    }

    private fun startCounting() {
        if (otherAppSince == null) otherAppSince = SystemClock.elapsedRealtime()
    }

    private fun stopCounting() {
        otherAppSince?.let { otherAppMs += SystemClock.elapsedRealtime() - it }
        otherAppSince = null
    }

    private fun isScreenInUse(): Boolean {
        val power = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val keyguard = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        return power.isInteractive && !keyguard.isKeyguardLocked
    }
}
