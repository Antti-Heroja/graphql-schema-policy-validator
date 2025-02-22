import { GraphQLInputObjectType, type GraphQLSchema } from 'graphql'

export const inputSuffixValidate = (
  schema: GraphQLSchema,
  errors: string[],
) => {
  const typeMap = schema.getTypeMap()
  for (const type of Object.values(typeMap)) {
    if (
      type instanceof GraphQLInputObjectType &&
      !type.name.endsWith('Input')
    ) {
      const { loc } = type.astNode || {}
      const errorMessage = `❌ Input type "${type.name}" must end with "Input"`
      const location = loc?.startToken?.line ?? 'unknown'
      errors.push(`${errorMessage} (Line: ${location})`)
    }
  }
}
