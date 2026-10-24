# Histórico de versões

## v1.3.0 — 24/10/2026
- **Instaladores com assistente** (Avançar → Avançar → Concluir, e o app abre sozinho): `.exe` para Windows (sem senha
  de administrador, atalhos no menu Iniciar e na Área de Trabalho, desinstalador), `.pkg` para macOS e `.deb` para Linux.
  Os pacotes portáteis (.zip/.tar.gz) continuam disponíveis.
- **Novo ícone:** ramo de oliveira com clave de fá.
- **Ícone fixo na barra:** no Dock do macOS e nos Favoritos do Linux, automaticamente na primeira abertura; no Windows,
  instruções para fixar na barra de tarefas no fim da instalação e no app.
- **Assistente de primeiro uso** no app: boas-vindas, aceite dos Termos e da Política de Privacidade, download do modelo
  de IA com um clique e perfil.
- **Perfil do usuário** (nova aba): nome, e-mail, telefone, profissão, registro profissional, CPF (com conferência),
  escritório, CNPJ (com conferência), cidade e logo.
- **Novo relatório de exportação** (PDF e Word): cabeçalho com logo e dados do escritório em todas as páginas, número do
  relatório, seções numeradas (identificação do arquivo, interlocutores, conteúdo, observações), **hash SHA-256 do
  áudio**, bloco de assinatura e rodapé com "Página X de Y" (agora também no Word).

## v1.2.1 — 14/10/2026
- Termos de Uso e Política de Privacidade, também disponíveis na aba **Sobre** do aplicativo.
- Manual do usuário (`docs/MANUAL.md`) e termos incluídos nos pacotes de instalação.

## v1.2.0 — 05/10/2026
- Exportação em **PDF**.
- Novo padrão dos documentos (PDF e Word): cabeçalho com tabela dos interlocutores, Arial 12, entrelinhas 1,5,
  3 pt antes e depois, margens ABNT, texto justificado e numeração de páginas.

## v1.1.0 — 05/10/2026
- Campos opcionais: nome e telefone de quem enviou e de quem recebeu, data de envio e de recebimento.
  Salvos no histórico, incluídos na busca e nas exportações TXT e DOCX.
- **Correção definitiva** da transcrição que não iniciava (o worker do motor passou a ser carregado de um Blob).
- O inicializador fecha automaticamente a versão anterior aberta.

## v1.0.1 — 05/10/2026 — *com defeito, não usar*
- Tentativa de correção da transcrição que não iniciava; o problema persistiu e foi resolvido na v1.1.0.

## v1.0.0 — 04/10/2026 — *com defeito, não usar*
- Primeira versão: transcrição local com Whisper.cpp + WebAssembly, lote, detecção de idioma,
  exportação TXT/DOCX/SRT, histórico, PWA e inicializador para Windows, macOS e Linux.
- Defeito conhecido: a transcrição não iniciava no Chrome.
