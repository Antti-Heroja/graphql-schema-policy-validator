import * as fs from 'node:fs'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchema } from '@graphql-tools/load'
import { program } from 'commander'
import type { GraphQLSchema } from 'graphql'

import {
  handleErrors,
  validateBasicTypeFields,
  validateMutationFields,
  validateMutationType,
  validateQueryFields,
  validateQueryType,
  validateSubscriptionFields,
  validateSubscriptionType,
  validateTypeType,
} from './validate/documentation'

interface ValidationRules {
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
    await validateSubscriptionType(schema, errors)
  }
  if (config.rules.validateSubscriptionFields) {
    await validateSubscriptionFields(schema, errors)
  }
  if (config.rules.validateQueryType) {
    await validateQueryType(schema, errors)
  }
  if (config.rules.validateQueryFields) {
    await validateQueryFields(schema, errors)
  }
  if (config.rules.validateMutationType) {
    await validateMutationType(schema, errors)
  }
  if (config.rules.validateMutationFields) {
    await validateMutationFields(schema, errors)
  }
  if (config.rules.validateTypeType) {
    validateTypeType(schema, errors)
  }
  if (config.rules.validateBasicTypeFields) {
    validateBasicTypeFields(schema, errors)
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
