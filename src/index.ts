import * as components from './components'
import type { App } from 'vue'
function install(app: App) {
  for (const key in components) {
    // @ts-expect-error
    app.component(key, components[key])
  }
}

export * from './components'