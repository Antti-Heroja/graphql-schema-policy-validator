import type { GraphQLObjectType, GraphQLSchema } from 'graphql'
import { isObjectType } from 'graphql'

const validateType = async (
  schema: GraphQLSchema,
  type: 'Subscription' | 'Query' | 'Mutation',
  errors: string[],
): Promise<void> => {
  console.log(
    `ℹ️ Validating properties of the GraphQL ${type} type for the schema...`,
  )

  const typeNode =
    schema[`get${type}Type`]?.()?.astNode?.name?.loc?.startToken?.prev?.prev
      ?.value
  if (!typeNode) {
    const rowNumber =
      schema[`get${type}Type`]?.()?.astNode?.name?.loc?.startToken?.prev?.line
    errors.push(`Type: ${type} is missing description from row → ${rowNumber}`)
  }
}

const validateFields = (
  graphqlObjectType: GraphQLObjectType,
  errors: string[],
): void => {
  const fields = graphqlObjectType.getFields()

  for (const fieldName in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, fieldName)) {
      const fieldNode = fields[fieldName].astNode
      const isComment = fieldNode?.name?.loc?.startToken?.prev?.kind
      if (isComment !== 'Comment') {
        const rowNumber = fieldNode?.loc?.startToken?.line
        errors.push(
          `Field: "${graphqlObjectType}.${fieldName}" is missing description from row → ${rowNumber}`,
        )
      }
    }
  }
}

const validateTypeFields = async (
  schema: GraphQLSchema,
  type: 'Subscription' | 'Query' | 'Mutation',
  errors: string[],
): Promise<void> => {
  console.log(
    `ℹ️ Validating properties of the GraphQL ${type} fields for the schema...`,
  )

  const typeObject = schema[`get${type}Type`]?.()
  if (!typeObject) {
    console.log(`${type} type fields are not defined in the schema.`)
    return
  }

  validateFields(typeObject, errors)
}

export const validateSubscriptionType = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateType(schema, 'Subscription', errors)

export const validateSubscriptionFields = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateTypeFields(schema, 'Subscription', errors)

export const validateQueryType = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateType(schema, 'Query', errors)

export const validateQueryFields = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateTypeFields(schema, 'Query', errors)

export const validateMutationType = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateType(schema, 'Mutation', errors)

export const validateMutationFields = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateTypeFields(schema, 'Mutation', errors)

export const validateTypeType = (schema: GraphQLSchema, errors: string[]) => {
  const typeMap = schema.getTypeMap()
  const userDefinedTypes = Object.values(typeMap).filter((type) => {
    if (
      type.astNode &&
      type.astNode.kind === 'ObjectTypeDefinition' &&
      type.name !== 'Subscription' &&
      type.name !== 'Query' &&
      type.name !== 'Mutation'
    ) {
      return true
    }
    return false
  })

  for (const type of userDefinedTypes) {
    const typeNode = type.astNode
    const isComment = typeNode?.name?.loc?.startToken?.prev?.kind
    if (isComment !== 'Comment') {
      const rowNumber = typeNode?.loc?.startToken?.line
      errors.push(
        `Type: "${type.name}" is missing description from row → ${rowNumber}`,
      )
    }
  }
}

export const validateBasicTypeFields = (
  schema: GraphQLSchema,
  errors: string[],
) => {
  const typeMap = schema.getTypeMap()
  const customTypeDefs = Object.keys(typeMap).filter(
    (typeName) =>
      !typeName.startsWith('__') && // Exclude introspection types
      ![
        'String',
        'ID',
        'Float',
        'Boolean',
        'Query',
        'Subscription',
        'Mutation',
      ].includes(typeName), // Exclude scalars
  )

  for (const typeName of customTypeDefs) {
    const type = typeMap[typeName]
    if (isObjectType(type)) {
      const fields = type.getFields()
      for (const fieldName of Object.keys(fields)) {
        const field = fields[fieldName]
        if (!field.description) {
          const rowNumber = field.astNode?.loc?.startToken?.line
          errors.push(
            `Field: "${fieldName}" of type "${typeName}" is missing a description from row -> ${rowNumber}`,
          )
        }
      }
    }
  }
}

export const handleErrors = (errors: string[]) => {
  if (errors.length > 0) {
    console.error('❌ Documentation validation failed:')
    for (const error of errors) {
      console.error(`  - ${error}`)
    }
    process.exit(1)
  } else {
    console.log('✅ Documentation validation passed.')
  }
}
