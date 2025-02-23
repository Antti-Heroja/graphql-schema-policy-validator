import { describe, expect, it } from 'bun:test'
import * as path from 'node:path'
import { checkDuplicateTypeDefinitionsInFolder } from './unique-types'

describe('checkDuplicateTypeDefinitionsInFolder', () => {
  it('returns empty array when no files exist', async () => {
    const fixturePath = path.resolve(import.meta.dir, 'fixtures/empty')
    const errors = await checkDuplicateTypeDefinitionsInFolder(fixturePath)
    expect(errors).toEqual([])
  })

  it('returns empty array when no duplicates are found', async () => {
    const fixturePath = path.resolve(import.meta.dir, 'fixtures/no-duplicates')
    const errors = await checkDuplicateTypeDefinitionsInFolder(fixturePath)
    expect(errors).toEqual([])
  })

  it('detects duplicate type definitions across files', async () => {
    const fixturePath = path.resolve(import.meta.dir, 'fixtures/duplicates')
    const errors = await checkDuplicateTypeDefinitionsInFolder(fixturePath)
    expect(errors).toEqual([
      '❌ Duplicate type definition found: "User" appears in files: file1.graphql, file2.graphql',
    ])
  })

  it('handles parsing errors in a file', async () => {
    const fixturePath = path.resolve(import.meta.dir, 'fixtures/parse-error')
    const errors = await checkDuplicateTypeDefinitionsInFolder(fixturePath)
    expect(errors.length).toBe(1)
    expect(errors[0]).toMatch(/❌ Failed to parse file2.graphql:/)
  })

  it('ignores non-type definitions', async () => {
    const fixturePath = path.resolve(import.meta.dir, 'fixtures/non-type-defs')
    const errors = await checkDuplicateTypeDefinitionsInFolder(fixturePath)
    expect(errors).toEqual([])
  })

  it('detects duplicates across multiple types', async () => {
    const fixturePath = path.resolve(
      import.meta.dir,
      'fixtures/multiple-duplicates',
    )
    const errors = await checkDuplicateTypeDefinitionsInFolder(fixturePath)
    expect(errors).toEqual([
      '❌ Duplicate type definition found: "User" appears in files: file1.graphql, file2.graphql',
      '❌ Duplicate type definition found: "Post" appears in files: file1.graphql, file3.graphql',
    ])
  })
})
