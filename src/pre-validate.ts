import { checkEmptyFiles } from './mandatory-pre-validate/check-empty-files.ts'
import { checkThatEverythingIsUnique } from './mandatory-pre-validate/unique-types.ts'

export const preValidateGraphQLFolder = async (
  folderPath: string,
): Promise<string[]> => {
  const errors: string[] = []

  const [uniqueErrors] = await Promise.all([
    checkThatEverythingIsUnique(folderPath),
    checkEmptyFiles(folderPath),
  ])

  errors.push(...uniqueErrors)
  return errors
}
