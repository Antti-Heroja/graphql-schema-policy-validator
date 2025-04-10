import { checkThatEverythingIsUnique } from './mandatory-pre-validate/unique-types.ts'

export const preValidateGraphQLFolder = async (
  folderPath: string,
): Promise<string[]> => {
  const errors: string[] = []

  const [uniqueErrors] = await Promise.all([
    checkThatEverythingIsUnique(folderPath),
  ])

  errors.push(...uniqueErrors)
  return errors
}
