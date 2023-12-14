package io.aelf.portkey.wallet

import android.content.Context
import io.aelf.portkey.components.logic.PortkeyMMKVStorage
import io.aelf.portkey.components.logic.TEMP
import io.aelf.portkey.components.logic.but
import io.aelf.portkey.tools.callJsMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async

object PortkeyWallet {
    fun lockWallet(callback: () -> Unit) {
        PortkeyMMKVStorage.remove("walletConfig" but TEMP)
        callback()
    }

    suspend fun lockWallet(coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.IO)): Boolean {
        return coroutineScope.async {
            PortkeyMMKVStorage.remove("walletConfig" but TEMP)
            true
        }.await()
    }

    fun exitWallet(context: Context, callback: (succeed: Boolean, reason: String?) -> Unit) {
        callJsMethod(
            applicationContext = context,
            taskName = "exitWallet",
            callback = {
                callback(it.status == "success", it.error?.toString())
            }
        )
    }

    fun isWalletExists(): Boolean {
        val walletConfig = PortkeyMMKVStorage.readString("walletConfig")
        return walletConfig?.isNotEmpty() ?: false
    }

    fun isWalletUnlocked(): Boolean {
        val tempWalletConfig = PortkeyMMKVStorage.readString("walletConfig" but TEMP)
        return tempWalletConfig?.isNotEmpty() ?: false
    }
}


