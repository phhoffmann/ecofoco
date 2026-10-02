"""Fail if a merged AndroidManifest.xml requests Health Connect permissions beyond steps."""
import sys
import xml.etree.ElementTree as ET

ANDROID_NAME = "{http://schemas.android.com/apk/res/android}name"
ALLOWED = {
    "android.permission.health.READ_STEPS",
    "android.permission.health.WRITE_STEPS",
}

manifest = sys.argv[1]
requested = {
    el.get(ANDROID_NAME)
    for tag in ("uses-permission", "uses-permission-sdk-23")
    for el in ET.parse(manifest).getroot().iter(tag)
}
health = sorted(p for p in requested if p and p.startswith("android.permission.health."))
unexpected = [p for p in health if p not in ALLOWED]

print(f"Health permissions in {manifest}:")
for p in health:
    print(f"  {p}")
if unexpected:
    print("Unexpected health permissions:", *unexpected, sep="\n  ")
    sys.exit(1)
