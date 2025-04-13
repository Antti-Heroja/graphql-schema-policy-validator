import { describe, expect, test } from 'bun:test'
import { exec } from 'node:child_process'
import path from 'node:path'

const cliPath = path.resolve(__dirname, '../src/cli.ts')

describe('Documentation Tests', () => {
  test('should pass when all rules are disabled', (done) => {
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
        done()
      },
    )
  })

  test('should report missing documentation errors when all rules are enabled', (done) => {
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

    exec(
      `bun ${cliPath} validate ${schemaPath} ${configPath}`,
      (_error, stdout, stderr) => {
        expect(stdout).toContain(`✅ Schema loaded successfully: ${schemaPath}`)
        expect(stderr).toContain('❌ Documentation validation failed:')
        expect(stderr).toContain(
          'Type: Subscription is missing description from row → 18',
        )
        expect(stderr).toContain(
          'Field: "Subscription.snackAdded" is missing description from row → 19',
        )
        expect(stderr).toContain(
          'Field: "Mutation.deleteSnack" is missing description from row → 15',
        )
        expect(stderr).toContain(
          'Field: "price" of type "Snack" is missing a description from row -> 4',
        )
        done()
      },
    )
  })
})
