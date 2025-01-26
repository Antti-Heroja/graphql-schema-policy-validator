import { write } from 'node:console'
import {
  GraphQLObjectType,
  type GraphQLSchema,
  type InterfaceTypeDefinitionNode,
  type ObjectTypeDefinitionNode,
} from 'graphql'
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
    if (rowNumber) {
      errors.push(
        `Type: ${type} is missing description from row → ${rowNumber}`,
      )
    }
  }
}

const validateFields = (
  graphqlObjectType: GraphQLObjectType,
  errors: string[],
): void => {
  const fields = graphqlObjectType.getFields()

  for (const fieldName in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, fieldName)) {
      const fieldNode = fields[fieldName]?.astNode
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

export const validateSubscriptionTypeDocumentation = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateType(schema, 'Subscription', errors)

export const validateSubscriptionFieldDocumentation = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateTypeFields(schema, 'Subscription', errors)

export const validateQueryTypeDocumentation = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateType(schema, 'Query', errors)

export const validateQueryFieldsDocumentation = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateTypeFields(schema, 'Query', errors)

export const validateMutationTypeDocumentation = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateType(schema, 'Mutation', errors)

export const validateMutationFieldDocumenation = (
  schema: GraphQLSchema,
  errors: string[],
): Promise<void> => validateTypeFields(schema, 'Mutation', errors)

export const validateTypeDocumentation = (
  schema: GraphQLSchema,
  errors: string[],
) => {
  console.log(
    'ℹ️ Validating properties of the GraphQL Type type for the schema...',
  )
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
    const isComment = type.astNode?.loc?.startToken?.prev?.kind
    const tokenType = type?.astNode?.loc?.startToken?.value
    if (tokenType === 'type' && isComment !== 'Comment') {
      const name = type?.name
      const rowNumber = type?.astNode?.loc?.startToken?.line
      errors.push(
        `Type: "${name}" is missing description from row → ${rowNumber}`,
      )
    }
  }
}

export const validateTypeFieldsDocumentation = (
  schema: GraphQLSchema,
  errors: string[],
) => {
  console.log(
    'ℹ️ Validating properties of the GraphQL Type fields for the schema...',
  )
  const typeMap = schema.getTypeMap()

  const filteredTypes = Object.keys(typeMap).filter(
    (key) =>
      typeMap[key] instanceof GraphQLObjectType &&
      !key.startsWith('__') &&
      key !== 'Query' &&
      key !== 'Subscription' &&
      key !== 'Mutation',
  )
  for (const typeName of filteredTypes) {
    const type = typeMap[typeName]?.astNode
    if (
      type &&
      (type.kind === 'ObjectTypeDefinition' ||
        type.kind === 'InterfaceTypeDefinition')
    ) {
      const fields = (
        type as ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode
      ).fields
      if (fields) {
        for (const field of fields) {
          const isComment = field?.name?.loc?.startToken?.prev?.kind
          if (isComment !== 'Comment') {
            const fieldName = field.name.value
            const rowNumber = field?.name?.loc?.startToken?.line
            errors.push(
              `Field: "${fieldName}" of type "${typeName}" is missing a description from row -> ${rowNumber}`,
            )
          }
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
