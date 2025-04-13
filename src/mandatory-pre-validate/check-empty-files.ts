import * as fs from 'node:fs/promises'
import * as path from 'node:path'

export const checkEmptyFiles = async (
  folderPath: string,
): Promise<string[]> => {
  const errors: string[] = []

  let files: string[]
  try {
    files = await fs.readdir(folderPath)
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
      return []
    }
    errors.push(
      `❌ Error accessing folder ${folderPath}: ${e instanceof Error ? e.message : String(e)}`,
    )
    return errors
  }

  const graphqlFiles = files.filter((file) => file.endsWith('.graphql'))

  for (const file of graphqlFiles) {
    const filePath = path.join(folderPath, file)
    const sdl = await fs.readFile(filePath, 'utf-8')
    if (sdl.trim() === '') {
      errors.push(`❌ File ${file} is empty or contains only whitespace`)
    }
  }

  return errors
}
