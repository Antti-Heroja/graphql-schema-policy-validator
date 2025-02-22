import { describe, expect, it } from 'bun:test'
import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'
import { namingConventionsValidate } from '../src/end-user-validate/naming-convention'

describe('namingConventionsValidate', () => {
  it('should pass when all naming conventions are correct', () => {
    const QueryType = new GraphQLObjectType({
      name: 'Query',
      fields: {
        validField: {
          type: GraphQLString,
          args: {
            validArg: { type: GraphQLString },
          },
        },
      },
    })

    const InputType = new GraphQLInputObjectType({
      name: 'UserInput',
      fields: {
        validField: { type: GraphQLString },
      },
    })

    const EnumType = new GraphQLEnumType({
      name: 'StatusEnum',
      values: {
        ACTIVE: { value: 'active' },
        INACTIVE: { value: 'inactive' },
      },
    })

    const schema = new GraphQLSchema({
      query: QueryType,
      types: [InputType, EnumType],
    })

    const errors: string[] = []
    namingConventionsValidate(schema, errors)

    expect(errors).toEqual([])
  })

  it('should detect incorrect type naming', () => {
    const BadObjectType = new GraphQLObjectType({
      name: 'badObject',
      fields: {
        validField: { type: GraphQLString },
      },
    })

    const schema = new GraphQLSchema({
      query: BadObjectType,
    })

    const errors: string[] = []
    namingConventionsValidate(schema, errors)

    expect(errors).toContain('❌ Type "badObject" should use PascalCase.')
  })

  it('should detect incorrect input type naming', () => {
    const BadInputType = new GraphQLInputObjectType({
      name: 'badInput',
      fields: {
        validField: { type: GraphQLString },
      },
    })

    const schema = new GraphQLSchema({
      types: [BadInputType],
    })

    const errors: string[] = []
    namingConventionsValidate(schema, errors)

    expect(errors).toContain('❌ Type "badInput" should use PascalCase.')
  })

  it('should detect incorrect field naming in object types', () => {
    const QueryType = new GraphQLObjectType({
      name: 'Query',
      fields: {
        InvalidField: { type: GraphQLString },
      },
    })

    const schema = new GraphQLSchema({
      query: QueryType,
    })

    const errors: string[] = []
    namingConventionsValidate(schema, errors)

    expect(errors).toContain(
      '❌ Field "InvalidField" in "Query" should use camelCase.',
    )
  })

  it('should detect incorrect argument naming', () => {
    const QueryType = new GraphQLObjectType({
      name: 'Query',
      fields: {
        validField: {
          type: GraphQLString,
          args: {
            InvalidArg: { type: GraphQLString },
          },
        },
      },
    })

    const schema = new GraphQLSchema({
      query: QueryType,
    })

    const errors: string[] = []
    namingConventionsValidate(schema, errors)

    expect(errors).toContain(
      '❌ Argument "InvalidArg" in "Query.validField" should use camelCase.',
    )
  })

  it('should detect incorrect enum naming', () => {
    const BadEnum = new GraphQLEnumType({
      name: 'badEnum',
      values: {
        VALID_VALUE: { value: 'valid' },
      },
    })

    const schema = new GraphQLSchema({
      types: [BadEnum],
    })

    const errors: string[] = []
    namingConventionsValidate(schema, errors)

    expect(errors).toContain('❌ Enum "badEnum" should use PascalCase.')
  })

  it('should detect incorrectly named enum values', () => {
    const BadEnum = new GraphQLEnumType({
      name: 'StatusEnum',
      values: {
        bad_value: { value: 'bad' },
      },
    })

    const schema = new GraphQLSchema({
      types: [BadEnum],
    })

    const errors: string[] = []
    namingConventionsValidate(schema, errors)

    expect(errors).toContain(
      '❌ Enum value "bad_value" in "StatusEnum" should use UPPER_CASE.',
    )
  })
})
