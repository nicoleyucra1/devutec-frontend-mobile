// Revisa que cada componente que recibe props tenga su .propTypes con todas esas props.
// Uso: npm run check:props
// React 19 (el de Expo SDK 58) ya no valida PropTypes por su cuenta, así que esta revisión es la que avisa si a un
// componente le falta declarar una prop (por ejemplo, cuando alguien agrega una nueva).
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath entiende carpetas con espacios en el nombre (por ejemplo "DBP Intelli")
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const FOLDERS = ['app', 'src']

function jsxFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return jsxFiles(path)
    return path.endsWith('.jsx') ? [path] : []
  })
}

// Lee lo que hay entre las llaves de ({ ... }) respetando llaves, corchetes y textos internos
function readBraces(text, start) {
  let depth = 0
  let quote = null
  for (let i = start; i < text.length; i++) {
    const char = text[i]
    if (quote) {
      if (char === '\\') i++
      else if (char === quote) quote = null
      continue
    }
    if (char === "'" || char === '"' || char === '`') quote = char
    else if ('{[('.includes(char)) depth++
    else if ('}])'.includes(char)) {
      depth--
      if (depth === 0) return text.slice(start + 1, i)
    }
  }
  return ''
}

// Nombres de las props: lo que está antes de "=" o ":" en cada parte separada por comas de primer nivel
function propNames(inside) {
  const names = []
  let depth = 0
  let quote = null
  let current = ''
  for (const char of inside + ',') {
    if (quote) {
      if (char === quote) quote = null
      current += char
      continue
    }
    if (char === "'" || char === '"' || char === '`') quote = char
    if ('{[('.includes(char)) depth++
    if ('}])'.includes(char)) depth--
    if (char === ',' && depth === 0) {
      const name = current.trim().split(/[=:]/)[0].trim()
      if (name && !name.startsWith('...')) names.push(name)
      current = ''
    } else current += char
  }
  return names
}

const problems = []
let checked = 0
for (const file of FOLDERS.flatMap((folder) => jsxFiles(join(ROOT, folder)))) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(/function ([A-Z]\w*)\(\s*\{/g)) {
    const name = match[1]
    const props = propNames(readBraces(text, match.index + match[0].length - 1))
    if (props.length === 0) continue
    checked++
    const declared = text.match(new RegExp(`\\b${name}\\.propTypes = \\{([\\s\\S]*?)\\n\\}`))
    if (!declared) {
      problems.push(`${relative(ROOT, file)}: ${name} no tiene propTypes`)
      continue
    }
    const missing = props.filter((prop) => !new RegExp(`^\\s*${prop}:`, 'm').test(declared[1]))
    if (missing.length) problems.push(`${relative(ROOT, file)}: a ${name}.propTypes le falta ${missing.join(', ')}`)
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`PropTypes OK: ${checked} componentes revisados`)
