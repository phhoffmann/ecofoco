"""Fail if a merged AndroidManifest.xml requests permissions EcoFoco strips on purpose."""
import sys
import xml.etree.ElementTree as ET

ANDROID_NAME = "{http://schemas.android.com/apk/res/android}name"
FORBIDDEN = {
    "android.permission.USE_BIOMETRIC",
    "android.permission.USE_FINGERPRINT",
    # Only appears as androidx.profileinstaller's receiver guard (android:permission),
    # which is not a request and must stay; fail if anything ever requests it.
    "android.permission.DUMP",
}

manifest = sys.argv[1]
requested = {
    el.get(ANDROID_NAME)
    for tag in ("uses-permission", "uses-permission-sdk-23")
    for el in ET.parse(manifest).getroot().iter(tag)
}
unexpected = sorted(requested & FORBIDDEN)

if unexpected:
    print(f"Forbidden permissions requested in {manifest}:", *unexpected, sep="\n  ")
    sys.exit(1)
print(f"No forbidden permissions requested in {manifest}")
