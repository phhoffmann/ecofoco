package com.paulohoffmann.ecofoco

import android.app.KeyguardManager
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Measures how long the user spends in other apps — screen on and unlocked — while EcoFoco
 * is in the background. Screen-off and lock-screen time never count, so pressing the power
 * button or an auto-lock doesn't look like leaving the app. The focus rules live in the web layer.
 *
 * Screen state is sampled on a timer rather than taken from SCREEN_OFF/USER_PRESENT broadcasts:
 * Android 14+ defers those to backgrounded apps, so an unlock straight into another app went unseen.
 */
@CapacitorPlugin(name = "AwayTracker")
class AwayTrackerPlugin : Plugin() {
    private val lock = Any()
    private var paused = false
    private var otherAppMs = 0L
    private var lastSampleAt = 0L
    private val handler = Handler(Looper.getMainLooper())

    private val sampler = object : Runnable {
        override fun run() {
            synchronized(lock) { sample() }
            handler.postDelayed(this, SAMPLE_INTERVAL_MS)
        }
    }

    override fun handleOnPause() {
        synchronized(lock) {
            paused = true
            otherAppMs = 0L
            lastSampleAt = SystemClock.elapsedRealtime()
        }
        handler.removeCallbacks(sampler)
        handler.postDelayed(sampler, SAMPLE_INTERVAL_MS)
    }

    override fun handleOnResume() {
        handler.removeCallbacks(sampler)
        synchronized(lock) {
            sample()
            paused = false
        }
    }

    override fun handleOnDestroy() {
        handler.removeCallbacks(sampler)
    }

    /** Time in other apps during the current background period, or the latest one once back in the app. */
    @PluginMethod
    fun getOtherAppTime(call: PluginCall) {
        val ms = synchronized(lock) {
            sample()
            otherAppMs
        }
        call.resolve(JSObject().apply { put("otherAppMs", ms) })
    }

    /** Credits the time since the last sample to other apps if the screen is on and unlocked now. */
    private fun sample() {
        if (!paused) return
        val now = SystemClock.elapsedRealtime()
        if (isScreenInUse()) otherAppMs += now - lastSampleAt
        lastSampleAt = now
    }

    private fun isScreenInUse(): Boolean {
        val power = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val keyguard = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        return power.isInteractive && !keyguard.isKeyguardLocked
    }

    private companion object {
        const val SAMPLE_INTERVAL_MS = 250L
    }
}
