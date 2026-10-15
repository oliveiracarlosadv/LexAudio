# Termos de Uso do Lex Audio

**Versão 1.0 — vigente a partir de 14 de outubro de 2026**

Estes Termos regulam o uso do **Lex Audio**, software de transcrição de áudio para texto com inteligência
artificial executada localmente, desenvolvido por **Carlos Alexandre Albuquerque Oliveira** ("Desenvolvedor").
Ao baixar, instalar ou usar o Lex Audio, você ("Usuário") declara que leu e concorda com estes Termos.
Se não concordar, não utilize o software.

## 1. O que é o Lex Audio

1.1. O Lex Audio converte arquivos de áudio (por exemplo, mensagens de voz do WhatsApp, Telegram e Signal,
gravações de reuniões e audiências) em texto, usando o modelo de reconhecimento de fala Whisper, executado
**inteiramente no computador do Usuário**.

1.2. O software é distribuído gratuitamente, em código aberto, sob a licença MIT
(arquivo `LICENSE` do repositório oficial). Estes Termos complementam essa licença quanto ao uso do programa.

## 2. Funcionamento local e conexões de rede

2.1. Os áudios, as transcrições, o histórico e os dados dos interlocutores são processados e guardados apenas
no navegador do computador do Usuário. **O Desenvolvedor não recebe, não armazena e não tem acesso a nenhum
desses dados.**

2.2. A única conexão de rede feita pelo Lex Audio é o download dos modelos de IA, que ocorre quando o Usuário
o solicita na aba "Modelos". Os arquivos são obtidos do serviço Hugging Face (huggingface.co), terceiro
independente, sujeito às próprias políticas. Nenhum áudio ou texto é enviado nessa conexão. O Usuário pode,
alternativamente, importar o arquivo do modelo manualmente, sem qualquer conexão.

2.3. O inicializador do aplicativo de computador atende somente ao próprio computador (endereço `127.0.0.1`)
e não aceita conexões de outras máquinas.

## 3. Responsabilidades do Usuário

3.1. O Usuário é o único responsável pelos áudios que transcreve e pelo uso que faz das transcrições,
devendo assegurar que possui base legal para tratar a voz e os dados pessoais de terceiros contidos nos
arquivos, nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).

3.2. É vedado usar o Lex Audio para transcrever conteúdo obtido por meio ilícito, inclusive interceptação de
comunicações sem autorização judicial (Lei nº 9.296/1996), ou para qualquer finalidade contrária à lei,
à moral ou a direitos de terceiros.

3.3. Os campos de remetente, destinatário, telefones e datas são preenchidos pelo próprio Usuário, que
responde pela exatidão dessas informações.

3.4. Cabe ao Usuário manter cópias de segurança das transcrições que considerar importantes. Limpar os dados
do navegador, desinstalá-lo ou trocar de computador pode apagar o histórico local de forma irreversível.

## 4. Natureza e limites da transcrição

4.1. A transcrição é produzida automaticamente por inteligência artificial e **pode conter erros**, omissões,
trocas de palavras, nomes próprios grafados incorretamente e marcações de tempo imprecisas, sobretudo em áudios
com ruído, sobreposição de vozes, sotaques acentuados ou baixa qualidade.

4.2. **A transcrição não é perícia, não tem fé pública e não substitui a ata notarial** (art. 384 do Código de
Processo Civil), a transcrição pericial ou a análise técnica de autenticidade do áudio. Antes de utilizá-la
em processo judicial ou administrativo, o Usuário deve conferi-la integralmente com o áudio original.

4.3. A identificação do idioma e a tradução opcional para o inglês também são automáticas e estão sujeitas às
mesmas limitações.

## 5. Isenção de garantias e limitação de responsabilidade

5.1. O Lex Audio é fornecido **"no estado em que se encontra"**, sem garantia de funcionamento ininterrupto,
de ausência de erros ou de adequação a uma finalidade específica, conforme a licença MIT.

5.2. Na máxima extensão permitida pela lei, o Desenvolvedor não se responsabiliza por danos diretos ou
indiretos decorrentes do uso ou da impossibilidade de uso do software, de erros de transcrição, da perda de
dados armazenados localmente ou do uso indevido do programa pelo Usuário.

5.3. Os pacotes para Windows e macOS ainda não possuem assinatura digital paga; por isso, os sistemas exibem
um aviso de segurança na primeira abertura. Recomenda-se baixar o Lex Audio **somente** da página oficial de
versões (Releases) do repositório.

## 6. Componentes de terceiros

O Lex Audio incorpora componentes de código aberto, cada um regido pela sua licença, entre eles:
Whisper.cpp e modelos Whisper (MIT), FFmpeg.wasm (núcleo com componentes GPL/LGPL), React (MIT),
docx (MIT), jsPDF (MIT), JSZip (MIT/GPLv3, à escolha) e Workbox (MIT).

## 7. Propriedade intelectual

O nome **Lex Audio**, a marca e o símbolo do ramo de oliveira identificam o projeto do Desenvolvedor.
A licença do código-fonte não autoriza o uso desses sinais para identificar produtos derivados de forma que
sugira vínculo com o Desenvolvedor.

## 8. Alterações destes Termos

Estes Termos podem ser atualizados a qualquer tempo. A versão vigente acompanha cada versão do software
(aba "Sobre" do aplicativo e arquivo `docs/TERMOS.md` do repositório). O uso de uma nova versão implica
concordância com os Termos que a acompanham.

## 9. Legislação e foro

Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de
Belém, Estado do Pará, para dirimir controvérsias deles decorrentes, ressalvadas as hipóteses em que a lei
assegure ao Usuário o foro do seu domicílio.

## 10. Contato

Dúvidas, sugestões e relatos de problemas: pelo repositório oficial,
https://github.com/oliveiracarlosadv/LexAudio (aba "Issues").
