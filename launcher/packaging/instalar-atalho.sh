#!/usr/bin/env sh
# Cria o atalho "Lex Audio" no menu de aplicativos do usuário.
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
APPS="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
mkdir -p "$APPS"
cat > "$APPS/lex-audio.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Lex Audio
Comment=Transforme áudio em texto. Totalmente offline.
Exec="$DIR/Lex Audio"
Icon=$DIR/lex-audio.png
Terminal=false
Categories=AudioVideo;Office;Utility;
DESKTOP
chmod +x "$DIR/Lex Audio"
echo "Atalho criado: procure por \"Lex Audio\" no menu de aplicativos."
