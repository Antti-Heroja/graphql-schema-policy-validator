import { beforeAll, describe, expect, it } from 'bun:test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { type GraphQLSchema, buildSchema } from 'graphql'
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
  it('returns no errors for a schema with fields in alphabetical order', () => {
    const errors: string[] = []
    validateAlphabeticalOrder(schema, errors)

    expect(errors).toEqual([])
  })

  it('returns errors for fields not in alphabetical order', () => {
    const schemaWithErrorsSDL = `
      type Query {
        zField: String
        aField: String
      }
    `
    const schemaWithErrors = buildSchema(schemaWithErrorsSDL)
    const errors: string[] = []

    validateAlphabeticalOrder(schemaWithErrors, errors)

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

  it('includes line numbers when available', () => {
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
})
