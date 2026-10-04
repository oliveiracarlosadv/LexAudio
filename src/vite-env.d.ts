/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __APP_VERSION__: string;

interface LaunchParams {
  readonly files: readonly FileSystemFileHandle[];
}
interface Window {
  launchQueue?: { setConsumer(consumer: (params: LaunchParams) => void): void };
}
