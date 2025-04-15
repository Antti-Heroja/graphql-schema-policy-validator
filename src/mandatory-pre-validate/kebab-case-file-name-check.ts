import { readdirSync } from 'node:fs'
import { basename, extname } from 'node:path'

const isValidFileName = (name: string): boolean => {
  // Match single lowercase word or kebab-case: word-word
  return /^[a-z]+(-[a-z]+)*$/.test(name)
}

export const checkGraphqlFileNames = (folderPath: string): string[] => {
  const errors: string[] = []
  const files = readdirSync(folderPath)

  for (const file of files) {
    const ext = extname(file)
    const base = basename(file, ext)

    if (ext !== '.graphql') {
      errors.push(`❌ Invalid extension: ${file} (must be .graphql)`)
      continue
    }

    if (!isValidFileName(base)) {
      errors.push(
        `❌ Invalid file name: ${file} (must be kebab-case or a single lowercase word)`,
      )
    }
  }
  return errors
}
