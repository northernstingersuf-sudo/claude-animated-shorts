"""Check spatial contrast, color diversity and distinct preview frames."""
import hashlib
import subprocess
import sys
from pathlib import Path

hashes = []
for name in sys.argv[1:]:
    data = subprocess.check_output(["ffmpeg","-v","error","-i",name,"-vf","scale=96:96,format=rgb24","-frames:v","1","-f","rawvideo","-"])
    assert len(data) == 96*96*3, name
    pixels = set(zip(data[0::3],data[1::3],data[2::3]))
    assert len(pixels) >= 64, f"{name}: flat or empty image ({len(pixels)} colors)"
    assert max(max(data[i::3])-min(data[i::3]) for i in range(3)) >= 40, f"{name}: insufficient spatial contrast"
    hashes.append(hashlib.sha256(data).hexdigest())
    print(f"PASS {Path(name).name}: {len(pixels)} distinct sampled colors")
assert len(hashes) == len(set(hashes)), "Identical still previews"
