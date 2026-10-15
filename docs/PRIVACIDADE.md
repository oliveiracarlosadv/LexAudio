# Política de Privacidade do Lex Audio

**Versão 1.0 — vigente a partir de 14 de outubro de 2026**

O Lex Audio foi construído para que **nenhum dado do Usuário saia do seu computador**. Esta Política explica,
nos termos da Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD), o que é armazenado,
onde e por quem.

## 1. Quem trata os dados

1.1. O Desenvolvedor (**Carlos Alexandre Albuquerque Oliveira**) **não coleta, não recebe e não armazena**
dados pessoais por meio do Lex Audio. Não há servidor, conta de usuário, analytics, cookies de rastreamento
ou publicidade.

1.2. Quando o Usuário transcreve áudios que contêm voz ou dados de terceiros (por exemplo, clientes,
testemunhas ou partes), ou preenche os campos de remetente e destinatário, **o próprio Usuário é o
controlador** desses dados para fins da LGPD, cabendo-lhe definir a finalidade, a base legal e o prazo de
guarda.

## 2. O que fica guardado no computador

| Dado | Onde | Para quê |
| --- | --- | --- |
| Áudio enviado | Somente na memória, durante o processamento | Converter e transcrever. **O áudio não é gravado.** |
| Texto transcrito, marcações de tempo, idioma, nome do arquivo | IndexedDB do navegador | Histórico local |
| Nome e telefone do remetente e do destinatário, datas de envio e recebimento | IndexedDB do navegador | Cabeçalho das exportações e busca |
| Modelos de IA baixados | Cache Storage do navegador | Funcionar sem internet |
| Preferências (tema, modelo, idioma, núcleos) | localStorage do navegador | Lembrar as escolhas |

Esses dados ficam vinculados ao navegador e ao endereço do aplicativo naquele computador; não são
sincronizados com nenhuma nuvem pelo Lex Audio.

## 3. Conexões externas

A única conexão externa é o **download dos modelos de IA** no serviço Hugging Face, iniciado pelo Usuário.
Como em qualquer download, esse serviço recebe dados técnicos da conexão (como o endereço IP), segundo a
política de privacidade dele. Nenhum áudio, texto ou dado de interlocutor é transmitido. Para evitar até essa
conexão, o modelo pode ser importado manualmente.

## 4. Segurança

- O processamento ocorre em um Web Worker local, isolado da interface.
- O aplicativo de computador atende apenas ao endereço `127.0.0.1`, inacessível a outras máquinas.
- A proteção física e lógica do computador (senha de acesso, criptografia de disco, antivírus) é de
  responsabilidade do Usuário e recomendada para quem trata dados sigilosos.

## 5. Como apagar os dados

- **Uma transcrição:** aba Histórico → ícone de lixeira.
- **Todo o histórico:** aba Histórico → "Limpar".
- **Modelos:** aba Modelos → ícone de lixeira.
- **Tudo:** apagar os dados do site `127.0.0.1:47821` nas configurações do navegador.

## 6. Direitos dos titulares

Como o Desenvolvedor não possui dados pessoais de ninguém por meio do Lex Audio, solicitações de titulares
(art. 18 da LGPD) relativas a transcrições devem ser dirigidas ao Usuário que as produziu e as mantém.

## 7. Alterações

Esta Política acompanha cada versão do software. Qualquer mudança que envolva envio de dados para fora do
computador será informada de forma destacada antes de entrar em vigor.

## 8. Contato

https://github.com/oliveiracarlosadv/LexAudio (aba "Issues").
