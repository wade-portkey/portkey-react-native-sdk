package io.aelf.portkey

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import io.aelf.portkey.native_modules.BiometricModule
import io.aelf.portkey.native_modules.NativeWrapperModule
import io.aelf.portkey.native_modules.NetworkModule
import io.aelf.portkey.native_modules.PermissionModule
import io.aelf.portkey.native_modules.RouterModule
import io.aelf.portkey.native_modules.StorageModule


class PortkeyNativePackages : ReactPackage {
    override fun createNativeModules(reactApplicationContext: ReactApplicationContext): MutableList<NativeModule> {
        return mutableListOf(
            RouterModule(reactApplicationContext),
            NativeWrapperModule(reactApplicationContext),
            NetworkModule(reactApplicationContext),
            StorageModule(reactApplicationContext),
            PermissionModule(reactApplicationContext),
            BiometricModule(reactApplicationContext)
        )
    }

    override fun createViewManagers(reactApplicationContext: ReactApplicationContext): MutableList<ViewManager<View, ReactShadowNode<*>>> {
        return mutableListOf()
    }

}
