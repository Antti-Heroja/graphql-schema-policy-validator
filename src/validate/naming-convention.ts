import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLObjectType,
  type GraphQLSchema,
} from 'graphql'
import type {
  GraphQLField,
  GraphQLFieldMap,
  GraphQLInputField,
  GraphQLInputFieldMap,
} from 'graphql'

const isPascalCase = (name: string) => /^[A-Z][a-zA-Z0-9]*$/.test(name)
const isCamelCase = (name: string) => /^[a-z][a-zA-Z0-9]*$/.test(name)
const isUpperCase = (name: string) => /^[A-Z0-9_]+$/.test(name)

export const namingConventionsValidate = (
  schema: GraphQLSchema,
  errors: string[],
) => {
  const typeMap = schema.getTypeMap()

  for (const type of Object.values(typeMap)) {
    if (type.name.startsWith('__')) continue

    if (
      (type instanceof GraphQLObjectType ||
        type instanceof GraphQLInputObjectType) &&
      !isPascalCase(type.name)
    ) {
      errors.push(`❌ Type "${type.name}" should use PascalCase.`)
    }

    if (type instanceof GraphQLEnumType) {
      if (!isPascalCase(type.name)) {
        errors.push(`❌ Enum "${type.name}" should use PascalCase.`)
      }

      for (const value of type.getValues()) {
        if (!isUpperCase(value.name)) {
          errors.push(
            `❌ Enum value "${value.name}" in "${type.name}" should use UPPER_CASE.`,
          )
        }
      }
    }

    if (type instanceof GraphQLObjectType) {
      const fields: GraphQLFieldMap<string, string> = type.getFields()
      for (const [fieldName, field] of Object.entries<
        GraphQLField<string, string>
      >(fields)) {
        if (!isCamelCase(fieldName)) {
          errors.push(
            `❌ Field "${fieldName}" in "${type.name}" should use camelCase.`,
          )
        }

        for (const arg of field.args) {
          if (!isCamelCase(arg.name)) {
            errors.push(
              `❌ Argument "${arg.name}" in "${type.name}.${fieldName}" should use camelCase.`,
            )
          }
        }
      }
    } else if (type instanceof GraphQLInputObjectType) {
      const fields: GraphQLInputFieldMap = type.getFields()
      for (const [fieldName, _field] of Object.entries<GraphQLInputField>(
        fields,
      )) {
        if (!isCamelCase(fieldName)) {
          errors.push(
            `❌ Input field "${fieldName}" in "${type.name}" should use camelCase.`,
          )
        }
      }
    }
  }
}
