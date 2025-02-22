import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { parse } from 'graphql'
import type { DocumentNode } from 'graphql'

/**
 * Checks for duplicate type definitions across all GraphQL files in a directory.
 * @param folderPath - The path to the folder containing .graphql files
 * @returns An array of error messages for duplicate types
 */
export const checkDuplicateTypeDefinitionsInFolder = async (
  folderPath: string,
): Promise<string[]> => {
  const errors: string[] = []
  const seenTypes = new Map<string, { count: number; files: string[] }>()

  try {
    // Read all files in the directory
    const files = await fs.readdir(folderPath)

    // Filter for .graphql files
    const graphqlFiles = files.filter((file) => file.endsWith('.graphql'))

    // Process each file
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

      // Check each definition in the file
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

    // Generate error messages for duplicates
    for (const [typeName, typeInfo] of seenTypes) {
      if (typeInfo.count > 1) {
        errors.push(
          `❌ Duplicate type definition found: "${typeName}" appears in files: ${typeInfo.files.join(', ')}`,
        )
      }
    }

    return errors
  } catch (e) {
    errors.push(
      `❌ Error processing folder ${folderPath}: ${e instanceof Error ? e.message : String(e)}`,
    )
    return errors
  }
}
