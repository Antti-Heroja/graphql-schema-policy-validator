import { expect, test } from 'bun:test'
import { resolve } from 'node:path'
import { spawnSync } from 'bun'

const FIXTURE_BASE = resolve(__dirname, '..', 'fixtures')

const runCLI = (
  args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
  const cliPath = resolve(__dirname, 'cli.ts')

  const result = spawnSync(['bun', 'run', cliPath, 'validate', ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    env: { ...process.env },
  })
  return {
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
    exitCode: result.exitCode,
  }
}

test('validates validSchema with all rules enabled (should pass)', () => {
  const schemaPath = `${FIXTURE_BASE}/full-valid-schema`
  const configPath = `${FIXTURE_BASE}/full-valid-schema/test-validation-rule-config.json`

  const { stdout, stderr, exitCode } = runCLI([schemaPath, configPath])

  const expectedLogs = [
    `✅ Schema loaded successfully: ${schemaPath}`,
    '🔍 Checking GraphQL schema: Ensuring Subscription type is documented ...',
    '🔍 Checking GraphQL schema: Ensuring all Subscription fields are documented ...',
    '🔍 Checking GraphQL schema: Ensuring Query type is documented ...',
    '🔍 Checking GraphQL schema: Ensuring all Query fields are documented ...',
    '🔍 Checking GraphQL schema: Ensuring Mutation type is documented ...',
    '🔍 Checking GraphQL schema: Ensuring all Mutation fields are documented ...',
    '🔍 Checking GraphQL schema: Ensuring all custom types are documented ...',
    '🔍 Checking GraphQL schema: Ensuring all fields of basic types are documented ...',
    '🔍 Checking GraphQL schema: Ensuring fields are in alphabetical order ...',
    '🔍 Checking GraphQL schema: Ensuring all `input` types have the "Input" suffix ...',
    '🔍 Checking GraphQL schema: Ensuring naming conventions are followed...\n' +
      '   🔍 Type names should be PascalCase\n' +
      '   🔍 Enum names should be PascalCase\n' +
      '   🔍 Enum values should be UPPER_CASE\n' +
      '   🔍 Field & argument names should be camelCase',
  ]
  expect(exitCode).toBe(0)
  for (const log of expectedLogs) {
    expect(stdout).toContain(log)
  }
  expect(stderr).toBe('')
})

test('detects duplicate types across schema files (should fail)', () => {
  const schemaPath = `${FIXTURE_BASE}/check-duplicates`
  const configPath = `${FIXTURE_BASE}/test-validation-rule-config.json`

  const { stdout, stderr, exitCode } = runCLI([schemaPath, configPath])

  expect(stderr).toContain(
    '❌ Duplicate type definition found: "Message" appears in files: test-schema1.graphql, test-schema2.graphql',
  )
  expect(stdout).toContain('✅ Schema loaded successfully')
  expect(stdout).toContain('✅ Documentation validation passed')
  expect(exitCode).toBe(0)
})

test('detects empty files across schema files (should fail)', () => {
  const schemaPath = `${FIXTURE_BASE}/check-empty-files`
  const configPath = `${FIXTURE_BASE}/test-validation-rule-config.json`

  const { stdout, stderr, exitCode } = runCLI([schemaPath, configPath])

  expect(stderr).toContain(
    '❌ Failed to parse empty-file2.graphql: Syntax Error: Unexpected <EOF>.',
  )
  expect(stdout).toContain('✅ Schema loaded successfully')
  expect(stdout).toContain('✅ Documentation validation passed')
  expect(exitCode).toBe(0)
})
