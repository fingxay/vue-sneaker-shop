const fs = require('fs')

const inputPath = 'src/assets/fonts/Roboto-Regular.ttf'
const outputPath = 'src/assets/fonts/roboto-normal.js'

const base64 = fs.readFileSync(inputPath, 'base64')
fs.writeFileSync(outputPath, `export default ${JSON.stringify(base64)}`)

console.log('done')