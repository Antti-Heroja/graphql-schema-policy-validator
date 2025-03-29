import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { type DocumentNode, parse } from 'graphql'

export const checkThatEverythingIsUnique = async (
  folderPath: string,
): Promise<string[]> => {
  const errors: string[] = []
  const seenTypes = new Map<string, { count: number; files: string[] }>()

  let files: string[]
  try {
    files = await fs.readdir(folderPath)
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
      // Folder doesn't exist, treat as empty
      return []
    }
    errors.push(
      `❌ Error processing folder ${folderPath}: ${e instanceof Error ? e.message : String(e)}`,
    )
    return errors
  }

  const graphqlFiles = files.filter((file) => file.endsWith('.graphql'))

  for (const file of graphqlFiles) {
    const filePath = path.join(folderPath, file)
    const sdl = await fs.readFile(filePath, 'utf-8')

    let ast: DocumentNode
    try {
      ast = parse(sdl)
    } catch (e) {
      errors.push(
        `❌ Failed to parse ${file}: ${e instanceof Error ? e.message : String(e)}`,
      )
      continue
    }

    for (const definition of ast.definitions) {
      if (
        definition.kind === 'ObjectTypeDefinition' ||
        definition.kind === 'InterfaceTypeDefinition' ||
        definition.kind === 'InputObjectTypeDefinition' ||
        definition.kind === 'EnumTypeDefinition' ||
        definition.kind === 'ScalarTypeDefinition' ||
        definition.kind === 'UnionTypeDefinition'
      ) {
        const typeName = definition.name.value

        const typeInfo = seenTypes.get(typeName)
        if (typeInfo) {
          typeInfo.count += 1
          typeInfo.files.push(file)
          seenTypes.set(typeName, typeInfo)
        } else {
          seenTypes.set(typeName, { count: 1, files: [file] })
        }
      }
    }
  }

  for (const [typeName, typeInfo] of seenTypes) {
    if (typeInfo.count > 1) {
      // Sort files for consistent order
      typeInfo.files.sort()
      errors.push(
        `❌ Duplicate type definition found: "${typeName}" appears in files: ${typeInfo.files.join(', ')}`,
      )
    }
  }

  return errors
}
