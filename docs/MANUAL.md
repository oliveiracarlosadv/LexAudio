# Manual do Usuário — Lex Audio

> Transforme áudio em texto. Totalmente offline.

## 1. Instalação

1. Acesse https://github.com/oliveiracarlosadv/LexAudio/releases/latest e baixe o **instalador** do seu sistema:
   - **Windows 10/11:** `LexAudio-Windows-Instalador.exe`
   - **macOS 11 ou superior (Apple Silicon e Intel):** `LexAudio-macOS-Instalador.pkg`
   - **Linux (Ubuntu, Debian, Mint):** `LexAudio-Linux.deb`
2. Dê dois cliques no arquivo baixado e clique em **Avançar** (no macOS, **Continuar**) até **Concluir**.
   - *Windows:* o instalador mostra os Termos de Uso, a pasta de instalação e a opção de atalho na Área de Trabalho.
     Não pede senha de administrador. Ao final, deixe marcado **Abrir o Lex Audio agora**.
   - *macOS:* o app é instalado em **Aplicativos** e abre sozinho ao final.
   - *Linux:* o arquivo abre na Central de Programas; clique em **Instalar**. O Lex Audio aparece no menu de aplicativos.
3. O Lex Audio abre no seu navegador padrão (Chrome, Edge, Firefox ou Safari) com o **assistente de primeiro uso**:
   boas-vindas → aceite dos termos → download do modelo de IA → perfil (opcional) → pronto.

**Ícone fixo na barra:**
- *macOS:* na primeira abertura, o ícone do Lex Audio é colocado no **Dock** automaticamente.
- *Linux (Ubuntu e similares):* na primeira abertura, o ícone vai para os **Favoritos** da barra.
- *Windows:* o Windows não permite que programas se fixem sozinhos. Abra o menu **Iniciar**, clique com o botão direito em
  **Lex Audio** e escolha **Fixar na barra de tarefas** (no Windows 11: **Mais → Fixar na barra de tarefas**).

Se você tirar o ícone da barra, ele não volta sozinho.

**Aviso de segurança na primeira vez** (o programa ainda não tem assinatura digital paga):
- *Windows:* em "O Windows protegeu o computador", clique em **Mais informações → Executar assim mesmo**.
- *macOS:* se o instalador for bloqueado, abra **Ajustes do Sistema → Privacidade e Segurança**, role até o fim e clique em
  **Abrir Mesmo Assim**; depois abra o instalador de novo.

**Versão portátil (sem instalar):** os arquivos `LexAudio-Windows.zip`, `LexAudio-macOS.zip` e `LexAudio-Linux.tar.gz`
continuam disponíveis: extraia e dê dois cliques em **Lex Audio**.

**Desinstalar:** *Windows:* Configurações → Aplicativos → Lex Audio → Desinstalar. *macOS:* arraste **Lex Audio** de
Aplicativos para o Lixo. *Linux:* `sudo apt remove lex-audio`.

> Atenção: o botão verde **Code → Download ZIP** do GitHub baixa o código-fonte, não o aplicativo.

## 2. Instalar um modelo de IA (uma única vez)

O assistente de primeiro uso já oferece o download. Para trocar ou adicionar modelos, use a aba **Modelos** e clique em
**Baixar** no modelo desejado:

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

## 5. Perfil

Na aba **Perfil**, preencha os dados que devem aparecer nos relatórios:

- **Dados pessoais:** nome completo, e-mail, telefone, profissão, número de registro profissional (ex.: OAB/PA 12.345),
  CPF e cidade (usada na data da assinatura).
- **Escritório:** nome, CNPJ e **logo** (PNG, JPG, WEBP ou SVG; prefira imagem horizontal com fundo branco ou transparente).
- **Relatório:** ligue ou desligue o cabeçalho com logo e o bloco de assinatura.

CPF e CNPJ são conferidos (dígitos verificadores) e formatados automaticamente. Use **Ver exemplo em PDF** para ver
como o relatório fica com seus dados. O perfil fica guardado apenas neste computador.

## 6. Exportar

Botão **Exportar**:

| Formato | Conteúdo |
| --- | --- |
| **PDF** | Relatório de transcrição pronto para anexar (detalhes abaixo). |
| **Word (.docx)** | O mesmo relatório, editável. |
| **Texto (.txt)** | Texto corrido, com interlocutores e hash SHA-256 no início, se houver. |
| **Legendas (.srt)** | Para players de vídeo. |

**Relatório de transcrição (PDF e Word):**

1. **Cabeçalho** em todas as páginas: logo, nome do escritório, CNPJ, e-mail e telefone (do Perfil).
2. **Título e número do relatório** (ex.: `LA-1A2B3C4D`) com data e hora de emissão.
3. **Identificação do arquivo:** nome, formato, tamanho, duração, **hash SHA-256**, idioma, modelo de IA e data da transcrição.
   O hash identifica o arquivo de áudio de forma única: qualquer alteração no arquivo muda o código.
4. **Interlocutores:** remetente e destinatário, telefones e datas.
5. **Conteúdo transcrito** com marcações de tempo.
6. **Observações** sobre o método (transcrição automática local, necessidade de conferência).
7. **Assinatura:** cidade e data, nome, profissão, registro e CPF.
8. **Rodapé:** número do relatório e "Página X de Y".

Padrão: Arial 12 (no PDF, Helvetica, de métricas idênticas), entrelinhas 1,5 no texto, 3 pt antes e depois de cada
parágrafo, margens ABNT (3 cm superior e esquerda, 2 cm inferior e direita).

Para exportar vários arquivos de uma vez, use **Lote** na fila ou selecione itens no Histórico; o resultado
vem num arquivo `.zip`.

## 7. Histórico

Todas as transcrições concluídas ficam na aba **Histórico**, com busca por nome do arquivo, conteúdo,
interlocutores e telefones. O áudio original **não** é guardado.

## 8. Encerrar e atualizar

- **Encerrar:** feche as abas do Lex Audio; o programa se encerra sozinho alguns minutos depois.
- **Atualizar:** baixe o instalador da versão nova e instale por cima; a versão anterior é fechada automaticamente.
  Histórico, modelos, perfil e preferências são mantidos.

## 9. Problemas comuns

| Sintoma | O que fazer |
| --- | --- |
| "Instale um modelo de IA para começar" | Baixe um modelo na aba Modelos. |
| "Motor de IA indisponível neste navegador" | Atualize o navegador ou use Chrome, Edge ou Firefox recentes. |
| Transcrição lenta | Use um modelo menor ou aumente os núcleos em Modelos → Desempenho. |
| Nomes próprios errados | Use o modelo Small ou maior e revise o texto. |
| O app não abre no macOS | Libere em Ajustes do Sistema → Privacidade e Segurança. |

## 10. Avisos importantes

A transcrição é automática e pode conter erros; não substitui perícia nem ata notarial. Confira sempre com o
áudio original antes de usar em processos. Leia os [Termos de Uso](TERMOS.md) e a
[Política de Privacidade](PRIVACIDADE.md).
