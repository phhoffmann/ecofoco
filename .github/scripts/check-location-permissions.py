"""Fail if a merged AndroidManifest.xml requests location beyond coarse (city-level) access."""
import sys
import xml.etree.ElementTree as ET

ANDROID_NAME = "{http://schemas.android.com/apk/res/android}name"
ALLOWED = {"android.permission.ACCESS_COARSE_LOCATION"}

manifest = sys.argv[1]
requested = {
    el.get(ANDROID_NAME)
    for tag in ("uses-permission", "uses-permission-sdk-23")
    for el in ET.parse(manifest).getroot().iter(tag)
}
location = sorted(p for p in requested if p and "LOCATION" in p)
unexpected = [p for p in location if p not in ALLOWED]

print(f"Location permissions in {manifest}:")
for p in location:
    print(f"  {p}")
if unexpected:
    print("Unexpected location permissions:", *unexpected, sep="\n  ")
    sys.exit(1)
