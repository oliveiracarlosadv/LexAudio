package main

// Fixa o atalho do Lex Audio na barra do sistema na primeira vez que o programa
// instalado é aberto: Dock no macOS e Favoritos do GNOME no Linux.
// Faz isso uma única vez (marca em um arquivo): se o usuário tirar o ícone,
// ele não volta. O Windows não permite que programas se fixem sozinhos na barra
// de tarefas; lá o usuário fixa com um clique (instruções no instalador e no app).

import (
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

func pinOnce() {
	dir, err := os.UserConfigDir()
	if err != nil {
		return
	}
	marker := filepath.Join(dir, "LexAudio", "fixado-na-barra")
	if _, err := os.Stat(marker); err == nil {
		return
	}

	var done bool
	switch runtime.GOOS {
	case "darwin":
		done = pinDock()
	case "linux":
		done = pinGnome()
	}
	if done {
		_ = os.MkdirAll(filepath.Dir(marker), 0o755)
		_ = os.WriteFile(marker, []byte("1\n"), 0o644)
	}
}

// pinDock põe o Lex Audio no Dock, se o app estiver instalado em /Applications.
func pinDock() bool {
	exe, err := os.Executable()
	if err != nil {
		return false
	}
	exe, _ = filepath.EvalSymlinks(exe)
	// .../Lex Audio.app/Contents/MacOS/LexAudio → .../Lex Audio.app
	app := filepath.Dir(filepath.Dir(filepath.Dir(exe)))
	if !strings.HasSuffix(app, ".app") || !strings.HasPrefix(app, "/Applications/") {
		return false // versão portátil (zip): não fixa um caminho provisório
	}
	current, _ := exec.Command("defaults", "read", "com.apple.dock", "persistent-apps").Output()
	name := filepath.Base(app)
	if strings.Contains(string(current), name) || strings.Contains(string(current), strings.ReplaceAll(name, " ", "%20")) {
		return true // já está no Dock
	}
	tile := "<dict><key>tile-data</key><dict><key>file-data</key><dict>" +
		"<key>_CFURLString</key><string>" + app + "</string>" +
		"<key>_CFURLStringType</key><integer>0</integer>" +
		"</dict></dict></dict>"
	if err := exec.Command("defaults", "write", "com.apple.dock", "persistent-apps", "-array-add", tile).Run(); err != nil {
		log.Printf("Não foi possível fixar no Dock: %v", err)
		return false
	}
	_ = exec.Command("killall", "Dock").Run() // o Dock recarrega com o novo ícone
	return true
}

// pinGnome adiciona o atalho aos Favoritos da barra do GNOME (Ubuntu e similares).
func pinGnome() bool {
	const id = "lex-audio.desktop"
	home, _ := os.UserHomeDir()
	candidates := []string{"/usr/share/applications/" + id, filepath.Join(home, ".local/share/applications", id)}
	found := false
	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			found = true
		}
	}
	if !found {
		return false // sem atalho instalado ainda (versão portátil sem instalar-atalho.sh)
	}
	out, err := exec.Command("gsettings", "get", "org.gnome.shell", "favorite-apps").Output()
	if err != nil {
		return false // não é GNOME: nada a fazer
	}
	list := strings.TrimSpace(string(out))
	if strings.Contains(list, id) {
		return true
	}
	list = strings.TrimPrefix(list, "@as ")
	var next string
	if list == "[]" || list == "" {
		next = "['" + id + "']"
	} else {
		next = strings.TrimSuffix(list, "]") + ", '" + id + "']"
	}
	if err := exec.Command("gsettings", "set", "org.gnome.shell", "favorite-apps", next).Run(); err != nil {
		log.Printf("Não foi possível fixar na barra: %v", err)
		return false
	}
	return true
}
