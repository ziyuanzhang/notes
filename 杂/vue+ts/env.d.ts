interface ImportMetaEnv {
  readonly VITE_APP_file_URL: string;
  // 更多环境变量...
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
