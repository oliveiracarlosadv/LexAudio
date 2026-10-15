# Manual do Usuário — Lex Audio

> Transforme áudio em texto. Totalmente offline.

## 1. Instalação

1. Acesse https://github.com/oliveiracarlosadv/LexAudio/releases/latest e baixe o arquivo do seu sistema:
   - **Windows 10/11:** `LexAudio-Windows.zip`
   - **macOS 11 ou superior (Apple Silicon e Intel):** `LexAudio-macOS.zip`
   - **Linux (x64):** `LexAudio-Linux.tar.gz`
2. Extraia o arquivo.
3. Dê dois cliques em **Lex Audio**. O aplicativo abre no seu navegador padrão (Chrome, Edge, Firefox ou Safari).

**Primeira abertura**
- *Windows:* se aparecer "O Windows protegeu o computador", clique em **Mais informações → Executar assim mesmo**.
- *macOS:* abra **Ajustes do Sistema → Privacidade e Segurança**, role até o fim e clique em **Abrir Mesmo Assim**.
- *Linux:* para criar um atalho no menu, rode `./instalar-atalho.sh` na pasta extraída.

> Atenção: o botão verde **Code → Download ZIP** do GitHub baixa o código-fonte, não o aplicativo.

## 2. Instalar um modelo de IA (uma única vez)

Na aba **Modelos**, clique em **Baixar** no modelo desejado:

| Modelo | Download | Indicado para |
| --- | --- | --- |
| Tiny | 31 MB | testes e áudios curtos |
| **Base** (recomendado) | 57 MB | uso diário |
| Small | 181 MB | português com nomes próprios e termos técnicos |
| Medium | 514 MB | gravações longas ou com ruído |
| Large v3 Turbo | 547 MB | máxima precisão (8 GB de RAM ou mais) |

Depois do download, o modelo fica no computador e tudo funciona **sem internet**.
Em computadores sem internet, baixe o arquivo `.bin` em outra máquina e use **Importar arquivo .bin**.

## 3. Transcrever

1. Na aba **Transcrever**, arraste os áudios para a área indicada ou clique para escolher (vários de uma vez).
2. Formatos aceitos: OGG, OPUS (WhatsApp), MP3, WAV, M4A, AAC, FLAC, WEBM e AMR.
3. Escolha o idioma ou deixe em **Detecção automática**.
4. O texto aparece em tempo real. Ao final, o status muda para **Concluído**.

Dicas: use **Trechos** para ver as marcações de tempo, **Texto** para o texto corrido e a lupa para buscar
palavras. O botão de cópia copia o texto inteiro.

## 4. Dados do áudio (opcional)

Abra **Dados do áudio** acima do texto e preencha, se quiser:

- **Quem enviou:** nome e telefone
- **Quem recebeu:** nome e telefone
- **Datas:** data e hora de envio e de recebimento

Os telefones são formatados automaticamente, por exemplo `(91) 98888-7777`. As informações podem ser
preenchidas durante ou depois da transcrição e também pelo Histórico.

## 5. Exportar

Botão **Exportar**:

| Formato | Conteúdo |
| --- | --- |
| **PDF** | Cabeçalho com a tabela dos interlocutores, dados do arquivo e conteúdo transcrito com marcações de tempo. Pronto para anexar. |
| **Word (.docx)** | O mesmo documento, editável. |
| **Texto (.txt)** | Texto corrido, com os dados dos interlocutores no início, se preenchidos. |
| **Legendas (.srt)** | Para players de vídeo. |

Padrão dos documentos PDF e Word: Arial 12 (no PDF, Helvetica, de métricas idênticas), entrelinhas 1,5,
3 pt antes e depois de cada parágrafo, margens ABNT (3 cm superior e esquerda, 2 cm inferior e direita).

Para exportar vários arquivos de uma vez, use **Lote** na fila ou selecione itens no Histórico; o resultado
vem num arquivo `.zip`.

## 6. Histórico

Todas as transcrições concluídas ficam na aba **Histórico**, com busca por nome do arquivo, conteúdo,
interlocutores e telefones. O áudio original **não** é guardado.

## 7. Encerrar e atualizar

- **Encerrar:** feche as abas do Lex Audio; o programa se encerra sozinho alguns minutos depois.
- **Atualizar:** baixe a versão nova e abra-a; a versão anterior é fechada automaticamente.
  Histórico, modelos e preferências são mantidos.

## 8. Problemas comuns

| Sintoma | O que fazer |
| --- | --- |
| "Instale um modelo de IA para começar" | Baixe um modelo na aba Modelos. |
| "Motor de IA indisponível neste navegador" | Atualize o navegador ou use Chrome, Edge ou Firefox recentes. |
| Transcrição lenta | Use um modelo menor ou aumente os núcleos em Modelos → Desempenho. |
| Nomes próprios errados | Use o modelo Small ou maior e revise o texto. |
| O app não abre no macOS | Libere em Ajustes do Sistema → Privacidade e Segurança. |

## 9. Avisos importantes

A transcrição é automática e pode conter erros; não substitui perícia nem ata notarial. Confira sempre com o
áudio original antes de usar em processos. Leia os [Termos de Uso](TERMOS.md) e a
[Política de Privacidade](PRIVACIDADE.md).
