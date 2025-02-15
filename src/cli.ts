import * as fs from 'node:fs'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchema } from '@graphql-tools/load'
import { program } from 'commander'
import type { GraphQLSchema } from 'graphql'

import {
  handleErrors,
  validateMutationFieldDocumenation,
  validateMutationTypeDocumentation,
  validateQueryFieldsDocumentation,
  validateQueryTypeDocumentation,
  validateSubscriptionFieldDocumentation,
  validateSubscriptionTypeDocumentation,
  validateTypeDocumentation,
  validateTypeFieldsDocumentation,
} from './validate/documentation'

import { validateAlphabeticalOrder } from './validate/alphabetical-order'
import { inputSuffixValidate } from './validate/input-suffix'
interface ValidationRules {
  alphabeticalOrderFields: boolean
  inputSuffix: boolean
  validateSubscriptionType: boolean
  validateSubscriptionFields: boolean
  validateQueryType: boolean
  validateQueryFields: boolean
  validateMutationType: boolean
  validateMutationFields: boolean
  validateTypeType: boolean
  validateBasicTypeFields: boolean
}

export const validateSchema = async (
  schemaPath: string,
  configPath: string,
) => {
  try {
    const schema = await loadSchema(schemaPath, {
      loaders: [new GraphQLFileLoader()],
    })
    console.log(`✅ Schema loaded successfully: ${schemaPath}`)
    await validate(schema, configPath)
  } catch (error) {
    console.error(`❌ Failed to load schema: ${schemaPath}`)

    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(String(error))
    }

    process.exit(1)
  }
}

const readConfig = (filePath: string): { rules: ValidationRules } => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContent) as { rules: ValidationRules }
  } catch (error) {
    throw new Error(
      `Failed to read or parse the config file: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

const validate = async (schema: GraphQLSchema, configFile: string) => {
  const errors: string[] = []
  const config = readConfig(configFile)

  if (config.rules.validateSubscriptionType) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring Subscription type is documented ...',
    )
    await validateSubscriptionTypeDocumentation(schema, errors)
  }

  if (config.rules.validateSubscriptionFields) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring all Subscription fields are documented ...',
    )
    await validateSubscriptionFieldDocumentation(schema, errors)
  }

  if (config.rules.validateQueryType) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring Query type is documented ...',
    )
    await validateQueryTypeDocumentation(schema, errors)
  }

  if (config.rules.validateQueryFields) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring all Query fields are documented ...',
    )
    await validateQueryFieldsDocumentation(schema, errors)
  }

  if (config.rules.validateMutationType) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring Mutation type is documented ...',
    )
    await validateMutationTypeDocumentation(schema, errors)
  }

  if (config.rules.validateMutationFields) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring all Mutation fields are documented ...',
    )
    await validateMutationFieldDocumenation(schema, errors)
  }

  if (config.rules.validateTypeType) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring all custom types are documented ...',
    )
    validateTypeDocumentation(schema, errors)
  }

  if (config.rules.validateBasicTypeFields) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring all fields of basic types are documented ...',
    )
    validateTypeFieldsDocumentation(schema, errors)
  }

  if (config.rules.alphabeticalOrderFields) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring fields are in alphabetical order ...',
    )
    validateAlphabeticalOrder(schema, errors)
  }

  if (config.rules.inputSuffix) {
    console.log(
      '🔍 Checking GraphQL schema: Ensuring all `input` types have the "Input" suffix ...',
    )
    inputSuffixValidate(schema, errors)
  }

  handleErrors(errors)
}

program
  .name('graphql-schema-policy-validator')
  .description('CLI tool for validating your schema policy')
  .version('0.1.0')

program
  .command('validate')
  .alias('v')
  .argument('<schemaPath>', 'Path to the GraphQL schema file(s)')
  .argument('<configFile>', 'Path to the config rule file')
  .description('Validate the specified GraphQL schema policy')
  .action(validateSchema)

program.parse(process.argv)
