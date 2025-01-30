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

interface ValidationRules {
  alphabeticalOrderFields: boolean
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
    await validateSubscriptionTypeDocumentation(schema, errors)
  }
  if (config.rules.validateSubscriptionFields) {
    await validateSubscriptionFieldDocumentation(schema, errors)
  }
  if (config.rules.validateQueryType) {
    await validateQueryTypeDocumentation(schema, errors)
  }
  if (config.rules.validateQueryFields) {
    await validateQueryFieldsDocumentation(schema, errors)
  }
  if (config.rules.validateMutationType) {
    await validateMutationTypeDocumentation(schema, errors)
  }
  if (config.rules.validateMutationFields) {
    await validateMutationFieldDocumenation(schema, errors)
  }
  if (config.rules.validateTypeType) {
    validateTypeDocumentation(schema, errors)
  }
  if (config.rules.validateBasicTypeFields) {
    validateTypeFieldsDocumentation(schema, errors)
  }
  if (config.rules.alphabeticalOrderFields) {
    validateAlphabeticalOrder(schema, errors)
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
