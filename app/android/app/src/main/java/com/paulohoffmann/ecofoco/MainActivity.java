package com.paulohoffmann.ecofoco;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Local plugins must be registered before the bridge is created in super.onCreate.
        registerPlugin(AwayTrackerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
