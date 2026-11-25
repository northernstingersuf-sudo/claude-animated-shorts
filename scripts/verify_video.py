"""Validate media structure, size, frame count, frame rate and visible frame motion."""
import argparse, json, subprocess
from fractions import Fraction

def run(*args):
    return subprocess.check_output(args)

p = argparse.ArgumentParser()
p.add_argument("file")
p.add_argument("--width", type=int, required=True)
p.add_argument("--height", type=int, required=True)
p.add_argument("--frames", type=int, required=True)
p.add_argument("--audio", action="store_true")
a = p.parse_args()
info = json.loads(run("ffprobe","-v","error","-count_frames","-show_streams","-of","json",a.file))
v = next(s for s in info["streams"] if s["codec_type"]=="video")
assert v["codec_name"] == "h264", v
assert (v["width"],v["height"]) == (a.width,a.height), v
assert int(v["nb_read_frames"]) == a.frames, v
assert Fraction(v["avg_frame_rate"]) == 30, v
if a.audio:
    assert any(s["codec_type"]=="audio" for s in info["streams"]), info
raw = run("ffmpeg","-v","error","-i",a.file,"-vf","scale=32:32,format=rgb24","-an","-f","rawvideo","-")
size=32*32*3
frames=[raw[i:i+size] for i in range(0,len(raw),size)]
assert len(frames)==a.frames
assert all(max(f)-min(f)>12 for f in frames), "Blank or flat frame"
assert len(set(frames))>1, "Frozen animation"
print(f"PASS: {a.file} ({a.width}x{a.height}, {a.frames} frames at 30fps)")
