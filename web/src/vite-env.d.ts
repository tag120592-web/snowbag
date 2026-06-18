/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*?url' {
  const url: string
  export default url
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_YANDEX_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
