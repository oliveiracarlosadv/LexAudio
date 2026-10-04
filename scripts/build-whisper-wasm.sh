#!/usr/bin/env bash
# Compila o motor Whisper.cpp para WebAssembly (com SIMD e pthreads) e copia
# o resultado para public/whisper/. Requer o Emscripten SDK ativo (emcc no PATH).
#
#   git clone https://github.com/emscripten-core/emsdk.git ~/emsdk
#   ~/emsdk/emsdk install latest && ~/emsdk/emsdk activate latest
#   source ~/emsdk/emsdk_env.sh
#   npm run build:whisper
set -euo pipefail

WHISPER_REF="${WHISPER_REF:-v1.7.6}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WASM_DIR="$ROOT/wasm"
BUILD_DIR="$WASM_DIR/build"
OUT_DIR="$ROOT/public/whisper"

command -v emcmake >/dev/null || { echo "Emscripten não encontrado. Rode 'source ~/emsdk/emsdk_env.sh'."; exit 1; }

if [ ! -d "$WASM_DIR/whisper.cpp" ]; then
  git clone --depth 1 --branch "$WHISPER_REF" https://github.com/ggml-org/whisper.cpp.git "$WASM_DIR/whisper.cpp"
fi

emcmake cmake -S "$WASM_DIR" -B "$BUILD_DIR" -DCMAKE_BUILD_TYPE=Release
cmake --build "$BUILD_DIR" --target lex-whisper -j

mkdir -p "$OUT_DIR"
cp "$BUILD_DIR/lex-whisper.js" "$BUILD_DIR/lex-whisper.wasm" "$OUT_DIR/"
echo "Motor Whisper compilado em public/whisper/ (lex-whisper.js + lex-whisper.wasm)"
