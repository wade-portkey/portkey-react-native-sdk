package com.app_react_native;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
//import expo.modules.kotlin.exception.Exceptions;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import io.aelf.core.PortkeyEntries;
import io.aelf.portkey.components.activities.DefaultReactActivity;
import io.aelf.portkey.config.StorageIdentifiers;
import com.ocetnik.timer.BackgroundTimerModule;
public class DemoActivity extends AppCompatActivity {
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_demo);
    }

    public void myClick(View view) {
        Intent intent = new Intent(this, DefaultReactActivity.class);
        String callbackId = String.valueOf(System.currentTimeMillis())+ String.valueOf(Math.random());
        intent.putExtra(StorageIdentifiers.PAGE_ENTRY, "app_react_native");
        intent.putExtra(StorageIdentifiers.PAGE_CALLBACK_ID, callbackId);
//        intent.putExtra(StorageIdentifiers.PAGE_PARAMS, params)
//        NavigationHolder.registerNativeCallback(callbackId, callback)
        startActivity(intent);
        // BaseActivityKt.navigateToAnotherReactActivity(this, PortkeyEntries.SIGN_IN_ENTRY.getEntryName());
    }
}
