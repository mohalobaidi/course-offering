// Add support to import vue files in TypeScript

// For all vue files...
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  
  // Create a dummy Component
  const component: DefineComponent<{}, {}, any>
  
  // Tell TypeScript to expect a vue files to export a Component
  export default component
}

declare module 'vue-notifyjs' {
  export default Object
}