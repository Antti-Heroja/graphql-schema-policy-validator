import { checkEmptyFiles } from './mandatory-pre-validate/check-empty-files.ts'
import { checkGraphqlFileNames } from './mandatory-pre-validate/kebab-case-file-name-check.ts'
import { checkThatEverythingIsUnique } from './mandatory-pre-validate/unique-types.ts'

export const preValidateGraphQLFolder = async (
  folderPath: string,
): Promise<string[]> => {
  const results = await Promise.all([
    checkThatEverythingIsUnique(folderPath),
    checkEmptyFiles(folderPath),
    checkGraphqlFileNames(folderPath),
  ])

  return results.flat()
}
