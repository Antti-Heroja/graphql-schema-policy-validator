import type { GraphQLSchema } from 'graphql'

export const uniqueTypeNamesValidate = (
  schema: GraphQLSchema,
  errors: string[],
) => {
  const typeMap = schema.getTypeMap()
  const seenTypes = new Set<string>()

  for (const type of Object.values(typeMap)) {
    if (type.name.startsWith('__')) continue // Ignore introspection types

    if (seenTypes.has(type.name)) {
      errors.push(
        `❌ Type "${type.name}" is defined multiple times in the schema.`,
      )
    } else {
      seenTypes.add(type.name)
    }
  }
}
