; Instalador do Lex Audio para Windows (Inno Setup 6).
; Assistente: Boas-vindas -> Termos -> Pasta -> Atalhos -> Instalar -> Concluir (abre o app).
; Gerado pelo release.yml:  ISCC /DAppVersion=1.3.0 /DSourceDir=..\..\out\win LexAudio.iss

#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif
#ifndef SourceDir
  #define SourceDir "..\..\out\win"
#endif

[Setup]
AppId={{842FEB91-6E23-4B40-B821-D517FCDA1447}
AppName=Lex Audio
AppVersion={#AppVersion}
AppVerName=Lex Audio {#AppVersion}
AppPublisher=Carlos Alexandre Albuquerque Oliveira
AppPublisherURL=https://github.com/oliveiracarlosadv/LexAudio
AppSupportURL=https://github.com/oliveiracarlosadv/LexAudio/issues
AppUpdatesURL=https://github.com/oliveiracarlosadv/LexAudio/releases/latest
AppCopyright=Carlos Alexandre Albuquerque Oliveira
VersionInfoVersion={#AppVersion}
DefaultDirName={autopf}\Lex Audio
DefaultGroupName=Lex Audio
DisableProgramGroupPage=yes
; instala sem pedir senha de administrador (só para o usuário atual);
; quem quiser pode escolher instalar para todos os usuários
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
LicenseFile={#SourceDir}\TERMOS.txt
SetupIconFile=lexaudio.ico
UninstallDisplayIcon={app}\Lex Audio.exe
UninstallDisplayName=Lex Audio
WizardStyle=modern
WizardImageFile=wizard.bmp
WizardSmallImageFile=wizard-small.bmp
Compression=lzma2/max
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=force
OutputDir=..\..\out
OutputBaseFilename=LexAudio-Windows-Instalador

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Messages]
brazilianportuguese.WelcomeLabel2=Este assistente vai instalar o Lex Audio {#AppVersion} no seu computador.%n%nTransforme áudio em texto. Totalmente offline: seus áudios nunca saem deste computador.%n%nClique em Avançar para continuar.
brazilianportuguese.FinishedLabel=O Lex Audio foi instalado. Ele abre no seu navegador.%n%nPARA FIXAR NA BARRA DE TAREFAS: abra o menu Iniciar, clique com o botão direito em Lex Audio e escolha Fixar na barra de tarefas. (O Windows não permite que programas façam isso sozinhos.)%n%nNa primeira abertura, um assistente rápido ajuda a baixar o modelo de inteligência artificial (uma única vez).

[Tasks]
Name: "desktopicon"; Description: "Criar atalho na Área de Trabalho"; GroupDescription: "Atalhos:"

[Files]
Source: "{#SourceDir}\Lex Audio.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceDir}\TERMOS.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceDir}\PRIVACIDADE.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceDir}\MANUAL.md"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\Lex Audio"; Filename: "{app}\Lex Audio.exe"; Comment: "Transforme áudio em texto. Totalmente offline."
Name: "{autodesktop}\Lex Audio"; Filename: "{app}\Lex Audio.exe"; Tasks: desktopicon; Comment: "Transforme áudio em texto. Totalmente offline."

[Run]
Filename: "{app}\Lex Audio.exe"; Description: "Abrir o Lex Audio agora"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; fecha o Lex Audio se estiver aberto antes de remover os arquivos
Filename: "{sys}\taskkill.exe"; Parameters: "/F /IM ""Lex Audio.exe"""; Flags: runhidden; RunOnceId: "FecharLexAudio"
