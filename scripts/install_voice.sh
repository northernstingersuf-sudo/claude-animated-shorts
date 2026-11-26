#!/usr/bin/env bash
set -euo pipefail
python -m pip install --index-url https://download.pytorch.org/whl/cpu torch==2.6.0 torchaudio==2.6.0
python -m pip install -r requirements-neural-audio.txt
python -m pip check
DIR="${KOKORO_MODEL_DIR:-.cache/kokoro}"
mkdir -p "$DIR"
for name in kokoro-v1.0.onnx voices-v1.0.bin; do
  if [ ! -s "$DIR/$name" ]; then
    curl --fail --location --retry 3 --output "$DIR/$name.tmp" "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$name"
    mv "$DIR/$name.tmp" "$DIR/$name"
  fi
done
sha256sum "$DIR/"*.onnx "$DIR/"*.bin
