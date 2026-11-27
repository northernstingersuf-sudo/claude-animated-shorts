"""Reject missing or mismatched practical footage before rendering."""
import json
import subprocess
import sys
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public" / "accessories-dont-count"
SHOTS = dict(zip((f"F{i:02d}.mp4" for i in range(1, 9)), (54, 60, 51, 57, 63, 54, 57, 84)))
assert sum(SHOTS.values()) == 480

def probe(path):
    return json.loads(subprocess.check_output(
        ["ffprobe", "-v", "error", "-count_frames", "-show_streams",
         "-show_format", "-of", "json", str(path)], text=True))

def check_video(path, expected):
    streams = probe(path)["streams"]
    v = next(s for s in streams if s["codec_type"] == "video")
    assert (v["width"], v["height"]) in ((1080, 1920), (2160, 3840)), "incorrect vertical dimensions"
    assert Fraction(v["r_frame_rate"]) == Fraction(30) and Fraction(v["avg_frame_rate"]) == Fraction(30), "expected 30 fps"
    assert int(v["nb_read_frames"]) == expected, f"expected {expected} decoded frames"
    assert v.get("sample_aspect_ratio", "1:1") in ("1:1", "N/A"), "expected square pixels"

def check_audio(path):
    a = next(s for s in probe(path)["streams"] if s["codec_type"] == "audio")
    assert int(a["sample_rate"]) == 48000 and a["channels"] == 2, "expected 48 kHz stereo"
    duration = Fraction(a["duration_ts"]) * Fraction(a["time_base"])
    assert duration == 16, f"expected 16 seconds, got {duration}"

def main():
    failures = []
    jobs = [(ROOT / name, lambda p, n=frames: check_video(p, n)) for name, frames in SHOTS.items()]
    jobs.append((ROOT / "mix.wav", check_audio))
    for path, check in jobs:
        try:
            if not path.is_file():
                raise FileNotFoundError("required original asset is missing")
            check(path)
            print(f"OK {path.name}")
        except Exception as exc:
            failures.append(f"{path.name}: {exc}")
    if failures:
        print("BLOCKED — " + "\n".join(failures), file=sys.stderr)
        return 1
    print("Basic metadata passed; actual CFR timestamps, rights, continuity and visual/audio review still required.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
