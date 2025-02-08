import * as fs from 'node:fs'
import * as path from 'node:path'
import { type GraphQLSchema, buildSchema } from 'graphql'
import { beforeAll, describe, expect, it } from 'bun:test'
import { validateAlphabeticalOrder } from '../src/validate/alphabetical-order.ts'

let schema: GraphQLSchema

beforeAll(() => {
  const schemaPath = path.resolve(
    import.meta.dir,
    './fixtures/alphabetical-order-test-schema.graphql',
  )
  const schemaSDL = fs.readFileSync(schemaPath, 'utf-8')
  schema = buildSchema(schemaSDL)
})

describe('validateAlphabeticalOrder', () => {
  it('returns no errors for a schema with types and fields in alphabetical order', () => {
    const errors: string[] = []
    console.log(schema)
    validateAlphabeticalOrder(schema, errors)
    expect(errors).toEqual([])
  })

  it('returns errors for types not in alphabetical order', () => {
    const schemaWithErrorsSDL = `
      type ZType {
        zField: String
      }
      type AType {
        aField: String
      }
    `
    const schemaWithErrors = buildSchema(schemaWithErrorsSDL)
    const errors: string[] = []

    validateAlphabeticalOrder(schemaWithErrors, errors)

    expect(errors).toEqual([
      'Type "ZType" is not in alphabetical order',
      'Type "AType" is not in alphabetical order',
    ])
  })

  it('returns errors for fields not in alphabetical order within types', () => {
    const schemaWithFieldErrorsSDL = `
       type Query {
         zField: String
         aField: String
       }
     `
    const schemaWithFieldErrors = buildSchema(schemaWithFieldErrorsSDL)
    const errors: string[] = []

    validateAlphabeticalOrder(schemaWithFieldErrors, errors)

    expect(errors).toEqual([
      'Field "zField" in type "Query" is not in alphabetical order --> line 3',
      'Field "aField" in type "Query" is not in alphabetical order --> line 4',
    ])
  })

  it('handles types starting with "__" (introspection types) without errors', () => {
    const errors: string[] = []
    validateAlphabeticalOrder(schema, errors)
    expect(errors.find((error) => error.includes('__'))).toBeUndefined()
  })

  it('includes line numbers for fields when available', () => {
    const schemaWithLinesSDL = `
      type Query {
        bField: String
        aField: String
      }
    `
    const schemaWithLines = buildSchema(schemaWithLinesSDL)
    const errors: string[] = []

    validateAlphabeticalOrder(schemaWithLines, errors)

    expect(errors).toEqual([
      'Field "bField" in type "Query" is not in alphabetical order --> line 3',
      'Field "aField" in type "Query" is not in alphabetical order --> line 4',
    ])
  })
  //
  it('returns errors for types not in alphabetical order', () => {
    const schemaWithTypesSDL = `
      type ZType {
        zField: String
      }
      type AType {
        aField: String
      }
      type MType {
        mField: String
      }
    `
    const schemaWithTypes = buildSchema(schemaWithTypesSDL)
    const errors: string[] = []

    validateAlphabeticalOrder(schemaWithTypes, errors)

    expect(errors).toEqual([
      'Type "ZType" is not in alphabetical order',
      'Type "AType" is not in alphabetical order',
      'Type "MType" is not in alphabetical order',
    ])
  })
})
