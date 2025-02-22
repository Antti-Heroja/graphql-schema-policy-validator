import { describe, expect, test } from 'bun:test'
import {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql'
import { inputSuffixValidate } from '../src/end-user-validate/input-suffix'

describe('Input Suffix Validation', () => {
  test('should pass when all input types have "Input" suffix', () => {
    const schema = new GraphQLSchema({
      types: [
        new GraphQLInputObjectType({ name: 'UserInput', fields: {} }),
        new GraphQLInputObjectType({ name: 'OrderInput', fields: {} }),
      ],
    })

    const errors: string[] = []
    inputSuffixValidate(schema, errors)

    expect(errors).toEqual([])
  })

  test('should report errors when input types are missing "Input" suffix', () => {
    const schema = new GraphQLSchema({
      types: [
        new GraphQLInputObjectType({ name: 'User', fields: {} }),
        new GraphQLInputObjectType({ name: 'OrderData', fields: {} }),
      ],
    })

    const errors: string[] = []
    inputSuffixValidate(schema, errors)

    expect(errors).toContain(
      '❌ Input type "User" must end with "Input" (Line: unknown)',
    )
    expect(errors).toContain(
      '❌ Input type "OrderData" must end with "Input" (Line: unknown)',
    )
  })

  test('should ignore non-input types', () => {
    const schema = new GraphQLSchema({
      types: [
        new GraphQLObjectType({ name: 'Query', fields: {} }),
        new GraphQLInputObjectType({ name: 'ValidInput', fields: {} }),
      ],
    })

    const errors: string[] = []
    inputSuffixValidate(schema, errors)

    expect(errors).toEqual([])
  })
})
