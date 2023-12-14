package io.aelf.portkey

import android.app.Activity
import android.app.Application
import android.content.res.Resources
import android.graphics.Color
import android.os.Bundle
import android.util.TypedValue
import android.view.ViewGroup
import android.widget.TextView
import com.facebook.react.ReactActivity
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.tencent.mmkv.MMKV
import io.aelf.core.PortKeySDKHolder
import io.aelf.portkey.components.logic.PortkeyReactNativeHost
import io.aelf.portkey.components.logic.hostInstance
import io.aelf.portkey.config.StorageIdentifiers

open class PortkeyReactApplication : Application(), ReactApplication {
    override fun onCreate() {
        super.onCreate()
        PortKeySDKHolder.initialize(this)
    }

    override fun getReactNativeHost(): ReactNativeHost {
        return PortKeySDKHolder.obtainNavHost(this)
    }

}
