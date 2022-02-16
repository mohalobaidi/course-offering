// import handler from './mainHandler'
// export default function handler ({ id, message, request } : any, port : any) {
//   const source = `${'extension'}: ${id}: ${message}`
//   console.log(` [in] ${source}`)

//   //...
//   if (true) {
//     console.log(`[out] ${source}`)
//     port.postMessage({ id, response: 'RESPONSE' })
//   } else {
//     console.log(`[err] ${source}:: ${'ERROR'}`)
//     port.postMessage({ id, error: 'ERROR' })
//   }
// }