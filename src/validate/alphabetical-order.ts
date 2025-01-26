//TODO add alphabetical-order

// import {
//   type GraphQLFieldMap,
//   type GraphQLObjectType,
//   type GraphQLSchema,
//   isObjectType,
// } from 'graphql'
//
// export const validateAlphabeticalOrder = (
//   schema: GraphQLSchema,
//   errors: string[],
// ) => {
//   const typeMap = schema.getTypeMap()
//
//   Object.values(typeMap).forEach((type) => {
//     if (!type.name.startsWith('__') && isObjectType(type)) {
//       validateTypeAlphabeticalOrder(type, errors)
//     }
//   })
// }
//
// const validateTypeAlphabeticalOrder = (
//   type: GraphQLObjectType,
//   errors: string[],
// ) => {
//   const fields: GraphQLFieldMap<any, any> = type.getFields()
//   const fieldNames = Object.keys(fields)
//
//   // Check if fields are in alphabetical order
//   const sortedFieldNames = [...fieldNames].sort()
//   if (!arraysAreEqual(fieldNames, sortedFieldNames)) {
//     const mismatches = getOutOfOrderFields(fieldNames, sortedFieldNames)
//     mismatches.forEach((fieldName) => {
//       const fieldAstNode = fields[fieldName].astNode
//       const line = fieldAstNode?.loc?.startToken?.line
//       errors.push(
//         `Field "${fieldName}" in type "${type.name}" is not in alphabetical order${
//           line ? ` (line ${line})` : ''
//         }`,
//       )
//     })
//   }
// }
//
// const arraysAreEqual = (arr1: string[], arr2: string[]) => {
//   return JSON.stringify(arr1) === JSON.stringify(arr2)
// }
//
// const getOutOfOrderFields = (original: string[], sorted: string[]) => {
//   return original.filter((fieldName, index) => fieldName !== sorted[index])
// }
