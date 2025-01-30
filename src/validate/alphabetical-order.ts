import {
  type GraphQLFieldMap,
  type GraphQLObjectType,
  type GraphQLSchema,
  isObjectType,
} from 'graphql'

export const validateAlphabeticalOrder = (
  schema: GraphQLSchema,
  errors: string[],
) => {
  const typeMap = schema.getTypeMap()

  for (const type of Object.values(typeMap)) {
    if (!type.name.startsWith('__') && isObjectType(type)) {
      validateTypeAlphabeticalOrder(type, errors)
    }
  }
}

const validateTypeAlphabeticalOrder = (
  type: GraphQLObjectType,
  errors: string[],
) => {
  const fields = type.getFields()
  const fieldNames = Object.keys(fields)
  const sortedFieldNames = [...fieldNames].sort()

  if (!arraysAreEqual(fieldNames, sortedFieldNames)) {
    reportOutOfOrderFields(
      fieldNames,
      sortedFieldNames,
      fields,
      type.name,
      errors,
    )
  }
}

const reportOutOfOrderFields = (
  fieldNames: string[],
  sortedFieldNames: string[],
  fields: GraphQLFieldMap<unknown, unknown>,
  typeName: string,
  errors: string[],
) => {
  for (const fieldName of getOutOfOrderFields(fieldNames, sortedFieldNames)) {
    addFieldError(fieldName, fields, typeName, errors)
  }
}

const addFieldError = (
  fieldName: string,
  fields: GraphQLFieldMap<unknown, unknown>,
  typeName: string,
  errors: string[],
) => {
  const field = fields[fieldName]
  if (field) {
    const line = field.astNode?.loc?.startToken?.line
    errors.push(
      `Field "${fieldName}" in type "${typeName}" is not in alphabetical order${
        line ? ` --> line ${line}` : ''
      }`,
    )
  } else {
    errors.push(`Field "${fieldName}" does not exist in fields object`)
  }
}

const arraysAreEqual = (arr1: string[], arr2: string[]) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2)
}

const getOutOfOrderFields = (original: string[], sorted: string[]) => {
  return original.filter((fieldName, index) => fieldName !== sorted[index])
}
