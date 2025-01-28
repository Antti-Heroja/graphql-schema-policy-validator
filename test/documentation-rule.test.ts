import { describe, expect, test } from 'bun:test'
import { exec } from 'node:child_process'
import path from 'node:path'

const cliPath = path.resolve(__dirname, '../src/cli.ts')

describe('Documentation Tests', () => {
  test('should validate that all parameter is false', (done) => {
    const schemaPath = path.resolve(
      __dirname,
      'fixtures',
      'test-schema.graphql',
    )

    const configPath = path.resolve(
      __dirname,
      'fixtures',
      'all-rules-false-config-test.json',
    )
    exec(
      `bun ${cliPath} validate ${schemaPath} ${configPath}`,
      (_error, stdout, stderr) => {
        expect(stdout).toContain(`✅ Schema loaded successfully: ${schemaPath}`)
        expect(stderr).toBe('')
        done()
      },
    )
  })
  test('should validate that all parameter is false', (done) => {
    const schemaPath = path.resolve(
      __dirname,
      'fixtures',
      'test-schema.graphql',
    )

    const configPath = path.resolve(
      __dirname,
      'fixtures',
      'all-rules-true-config-test.json',
    )

    const expectedResult = `❌ Documentation validation failed:
  - Type: Subscription is missing description from row → 18
  - Field: "Subscription.snackAdded" is missing description from row → 19
  - Field: "Subscription.snackUpdated" is missing description from row → 20
  - Field: "Subscription.snackDeleted" is missing description from row → 21
  - Type: Query is missing description from row → 7
  - Field: "Query.snacks" is missing description from row → 8
  - Field: "Query.snack" is missing description from row → 9
  - Type: Mutation is missing description from row → 12
  - Field: "Mutation.addSnack" is missing description from row → 13
  - Field: "Mutation.updateSnack" is missing description from row → 14
  - Field: "Mutation.deleteSnack" is missing description from row → 15
  - Type: "Snack" is missing description from row → 1
  - Field: "id" of type "Snack" is missing a description from row -> 2
  - Field: "name" of type "Snack" is missing a description from row -> 3
  - Field: "price" of type "Snack" is missing a description from row -> 4
`
    exec(
      `bun ${cliPath} validate ${schemaPath} ${configPath}`,
      (_error, stdout, stderr) => {
        expect(stdout).toContain(`✅ Schema loaded successfully: ${schemaPath}`)
        expect(stderr).toBe(expectedResult)
        done()
      },
    )
  })
})
