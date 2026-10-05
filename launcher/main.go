// Lex Audio — inicializador.
//
// Um único executável que carrega o app web embutido (pasta dist/), serve-o
// apenas para este computador (127.0.0.1) com os cabeçalhos COOP/COEP exigidos
// pelo Whisper.cpp em WebAssembly e abre o navegador padrão.
//
// A porta é fixa de propósito: o navegador guarda modelos e histórico por
// origem (endereço + porta), então uma porta aleatória "perderia" tudo a cada uso.
package main

import (
	"embed"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path"
	"runtime"
	"strings"
	"sync/atomic"
	"time"
)

//go:embed all:dist
var embedded embed.FS

const (
	port        = 47821
	idleTimeout = 5 * time.Minute // encerra sozinho quando nenhuma aba do app está aberta
	pingPath    = "/__lex/ping"
	quitPath    = "/__lex/quit"
	appID       = "lex-audio"
)

// definida no build: -ldflags "-X main.version=1.2.3"
var version = "dev"

var lastSeen atomic.Int64

func main() {
	url := fmt.Sprintf("http://127.0.0.1:%d/", port)

	ln, err := listen()
	if err != nil {
		running := runningVersion(url)
		switch {
		case running == version:
			// Esta versão já está aberta: só mostra a janela de novo.
			openBrowser(url)
			return
		case running != "":
			// Outra versão está aberta: pede para ela sair e assume o lugar.
			requestQuit(url)
			for i := 0; i < 20 && err != nil; i++ {
				time.Sleep(250 * time.Millisecond)
				ln, err = listen()
			}
			if err != nil {
				log.Fatalf("Feche a versão anterior do Lex Audio e tente de novo: %v", err)
			}
		default:
			log.Fatalf("A porta %d está ocupada por outro programa: %v", port, err)
		}
	}

	site, err := fs.Sub(embedded, "dist")
	if err != nil {
		log.Fatal(err)
	}
	_ = mime.AddExtensionType(".wasm", "application/wasm")
	_ = mime.AddExtensionType(".webmanifest", "application/manifest+json")
	_ = mime.AddExtensionType(".mjs", "text/javascript")

	mux := http.NewServeMux()
	mux.HandleFunc(pingPath, func(w http.ResponseWriter, r *http.Request) {
		lastSeen.Store(time.Now().UnixNano())
		w.Header().Set("Cache-Control", "no-store")
		_, _ = w.Write([]byte(appID + " " + version))
	})
	mux.HandleFunc(quitPath, func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "use POST", http.StatusMethodNotAllowed)
			return
		}
		_, _ = w.Write([]byte("ok"))
		go func() {
			time.Sleep(100 * time.Millisecond)
			os.Exit(0)
		}()
	})
	mux.Handle("/", spa(site))

	lastSeen.Store(time.Now().UnixNano())
	go watchdog()
	go func() {
		time.Sleep(300 * time.Millisecond)
		openBrowser(url)
	}()

	log.Printf("Lex Audio em %s (feche todas as abas para encerrar)", url)
	srv := &http.Server{Handler: isolation(mux), ReadHeaderTimeout: 10 * time.Second}
	if err := srv.Serve(ln); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}

// isolation adiciona os cabeçalhos que ativam o SharedArrayBuffer (threads do Whisper).
func isolation(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Set("Cross-Origin-Opener-Policy", "same-origin")
		h.Set("Cross-Origin-Embedder-Policy", "require-corp")
		h.Set("Cross-Origin-Resource-Policy", "same-origin")
		h.Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(w, r)
	})
}

// spa serve os arquivos do app e devolve o index.html para rotas desconhecidas.
func spa(site fs.FS) http.Handler {
	files := http.FileServer(http.FS(site))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		name := strings.TrimPrefix(path.Clean(r.URL.Path), "/")
		if name == "" {
			name = "index.html"
		}
		if _, err := fs.Stat(site, name); err != nil {
			r.URL.Path = "/"
			name = "index.html"
		}
		if name == "index.html" || name == "sw.js" || strings.HasSuffix(name, ".webmanifest") {
			w.Header().Set("Cache-Control", "no-cache")
		}
		files.ServeHTTP(w, r)
	})
}

func watchdog() {
	for range time.Tick(30 * time.Second) {
		if time.Since(time.Unix(0, lastSeen.Load())) > idleTimeout {
			log.Print("Nenhuma aba do Lex Audio aberta; encerrando.")
			os.Exit(0)
		}
	}
}

func listen() (net.Listener, error) {
	return net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
}

// runningVersion devolve a versão do Lex Audio que ocupa a porta ("" se não for o Lex Audio).
// Versões antigas respondiam só "lex-audio"; nesse caso devolve "antiga".
func runningVersion(url string) string {
	client := http.Client{Timeout: 2 * time.Second}
	res, err := client.Get(strings.TrimSuffix(url, "/") + pingPath)
	if err != nil {
		return ""
	}
	defer res.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(res.Body, 128))
	text := strings.TrimSpace(string(body))
	if !strings.HasPrefix(text, appID) {
		return ""
	}
	if v := strings.TrimSpace(strings.TrimPrefix(text, appID)); v != "" {
		return v
	}
	return "antiga"
}

func requestQuit(url string) {
	client := http.Client{Timeout: 2 * time.Second}
	res, err := client.Post(strings.TrimSuffix(url, "/")+quitPath, "text/plain", nil)
	if err == nil {
		res.Body.Close()
	}
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	if err := cmd.Start(); err != nil {
		log.Printf("Abra manualmente no navegador: %s", url)
	}
}
