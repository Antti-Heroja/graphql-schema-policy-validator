import {
  type GraphQLFieldMap,
  type GraphQLNamedType,
  type GraphQLObjectType,
  type GraphQLSchema,
  isObjectType,
} from 'graphql'

import {
  isIntrospectionType,
  isScalarType,
  isSpecifiedScalarType,
} from 'graphql'

const getUserDefinedTypesSorted = (schema: GraphQLSchema) => {
  return Object.values(schema.getTypeMap())
    .filter((type) => !isBuiltInType(type) && !isIntrospectionType(type))
    .map((type) => type.name)
}

const isBuiltInType = (type: GraphQLNamedType): boolean => {
  return isScalarType(type) && isSpecifiedScalarType(type) // Excludes built-in scalars (String, Int, etc.)
}

export const validateAlphabeticalOrder = (
  schema: GraphQLSchema,
  errors: string[],
) => {
  const typeNames = getUserDefinedTypesSorted(schema)
  const sortedTypeNames = [...typeNames].sort()
  if (!arraysAreEqual(typeNames, sortedTypeNames)) {
    reportOutOfOrderTypes(typeNames, sortedTypeNames, errors)
  }

  for (const typeName of typeNames) {
    const type = schema.getType(typeName)
    if (isObjectType(type)) {
      validateTypeAlphabeticalOrder(type, errors)
    }
  }
}

const reportOutOfOrderTypes = (
  typeNames: string[],
  sortedTypeNames: string[],
  errors: string[],
) => {
  for (const typeName of getOutOfOrderFields(typeNames, sortedTypeNames)) {
    errors.push(`Type "${typeName}" is not in alphabetical order`)
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
