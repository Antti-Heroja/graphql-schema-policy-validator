import { expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'bun'

const runCLI = (
  args: string[],
): { stdout: string; stderr: string; exitCode: number } => {
  const cliPath = resolve(__dirname, 'cli.ts')
  console.log('CLI Path:', cliPath)
  console.log('Args:', ['bun', 'run', cliPath, 'validate', ...args])

  const result = spawnSync(['bun', 'run', cliPath, 'validate', ...args], {
    stdout: 'pipe',
    stderr: 'pipe',
    env: { ...process.env },
  })

  console.log('Exit Code:', result.exitCode)
  console.log('Stdout:', result.stdout.toString())
  console.log('Stderr:', result.stderr.toString())

  return {
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
    exitCode: result.exitCode,
  }
}

const fixtureBase = resolve(__dirname, '..', 'fixtures')

test('validates validSchema with all rules enabled (should pass)', () => {
  const schemaPath = `${fixtureBase}/full-valid-schema`
  const configPath = `${fixtureBase}/full-valid-schema/test-validation-rule-config.json`

  if (!existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`)
  }
  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`)
  }

  console.log('Schema Path:', schemaPath)
  console.log('Config Path:', configPath)

  const { stdout, stderr, exitCode } = runCLI([schemaPath, configPath])

  const expectedLogs = [
    // '✅ Pre schema validation passed.',
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
