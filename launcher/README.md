# Inicializador do Lex Audio

Executável único (Go, sem dependências) que embute o build web, serve-o em
`http://127.0.0.1:47821` com os cabeçalhos COOP/COEP e abre o navegador padrão.
Encerra sozinho 5 minutos depois que a última aba do app é fechada.

Os pacotes para Windows, macOS e Linux são gerados pelo workflow
`.github/workflows/release.yml`. Para testar localmente:

```bash
npm run build && rm -rf launcher/dist && cp -R dist launcher/dist
cd launcher && go run .
```
