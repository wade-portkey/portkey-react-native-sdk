package io.aelf.core

import android.app.Application
import android.widget.Toast
import com.tencent.mmkv.MMKV
import io.aelf.portkey.BuildConfig
import io.aelf.portkey.components.logic.PortkeyReactNativeHost

object PortKeySDKHolder {
    var initialized = false
    private var navHost: PortkeyReactNativeHost? = null
    private fun createNewHost(application: Application): PortkeyReactNativeHost {
        return PortkeyReactNativeHost(
            application = application,
            isDebug = BuildConfig.IS_DEBUG
        )
    }

    fun initialize(application: Application) {
        MMKV.initialize(application)
        navHost = createNewHost(application)
        navHost?.reactInstanceManager?.createReactContextInBackground();
        navHost?.reactInstanceManager?.addReactInstanceEventListener {
            initialized = true
            if (BuildConfig.DEBUG)
                Toast.makeText(
                    application,
                    "sdk reloaded.",
                    Toast.LENGTH_LONG
                ).show()
        }
    }

    fun obtainNavHost(application: Application): PortkeyReactNativeHost {
        if (navHost == null) {
            navHost = createNewHost(application)
        }
        return navHost!!
    }
}
