---

# graphql-schema-policy-validator

`graphql-schema-policy-validator` is a CLI tool designed for effortless `GraphQL` schema validation. It follows a strict no customization approach, enforcing only universal best practices.

This linter validates  `GraphQL` schemas written in Schema Definition Language `SDL`. Unlike code-first approaches that generate schemas dynamically, `SDL`-based schemas are manually written using `.graphql` files. This ensures early detection of issues before the schema is executed, helping enforce best practices and maintain a well-structured GraphQL API.

## Design Goals

✅ Extremely easy to use – Install once, run instantly. No configuration needed.
🚫 No custom rules – The tool enforces a fixed set of best practices to ensure schema consistency.
🛠️ Prevents costly refactoring – Use it at the start of a project to avoid structural issues that could impact clients later.

This tool is currently in initial development and aims to be blazingly fast, similar to Biome.

## Installation

To install the dependencies, run:

```bash
bun install
```

``

- Validate `./demoSchema` → Replace `./demoSchema` with the path to your own `GraphQL` schema file. Example --> `./path-to-my/schema`
- `validation-rule-config.json` → This file allows you to select which rules to enable.
By default, all rules are enabled.

### Notes

Replace `./demoSchema` and `validation-rule-config.json` with the paths to your actual schema and configuration files if they differ.
The `validation-rule-config.json` file should contain your predefined rule set, which the CLI tool will use to validate the schema. The file is validated through the interface so all rules much always be defined.

### Arguments

- `./demoSchema`: Path to the GraphQL schema file or directory you want to validate. In your project you will use your own schema file or directory.
- `validation-rule-config.json`: Configuration file containing the rules and policies for validation.

## Purpose

The `graphql-schema-policy-validator` is a tool designed to ensure compliance with your project, team, or company's schema policies. It validates GraphQL schemas against predefined rules and throws errors if any violations are detected.

This helps maintain consistency, enforce standards, and ensure adherence to best practices across your GraphQL API development.

## Mandatory Pre-Validation Rules

The tool ensures that there are no duplicate type definitions within the schema. Only one definition per type (e.g., `ObjectTypeDefinition`, `InterfaceTypeDefinition`, `InputObjectTypeDefinition`, `EnumTypeDefinition`, `ScalarTypeDefinition`, or `UnionTypeDefinition``) is allowed across all schema files. While a single schema file can contain multiple type definitions, duplicates of the same type name across different files will trigger an error. This rule is mandatory and cannot be disabled. The tool supports only files with the`.graphql` extension.

## Supported Rules

You can define all project-specific configuration parameters in the `validation-rule-config.json` file.

Example `validation-rule-config.json`:

```json
{
  "rules": {
    "alphabeticalOrderFields": true,
    "inputSuffix": true,
    "namingConvention": true,
    "validateSubscriptionType": true,
    "validateSubscriptionFields": true,
    "validateQueryType": true,
    "validateQueryFields": true,
    "validateMutationType": true,
    "validateMutationFields": true,
    "validateTypeType": true,
    "validateBasicTypeFields": true
  }
}
```

## Supported Rules

The following rules ensure that the schema follows `GraphQL` best practices.

- `alphabeticalOrderFields`: Ensures that all type and field definitions are in alphabetical order.
- `inputSuffix`: Ensures that all input types have the `Input` suffix.
- `namingConvention`: Enforces consistent naming conventions for types, fields, and arguments.
- `validateSubscriptionType`: Ensures that subscription types are documented.
- `validateSubscriptionFields`: Ensures that subscription fields are documented.
- `validateQueryType`: Ensures that query types are documented.
- `validateQueryFields`: Ensures that query fields are documented.
- `validateMutationType`: Ensures that mutation types are documented.
- `validateMutationFields`: Ensures that mutation fields are documented.
- `validateTypeType`: Ensures that custom types are documented.
- `validateBasicTypeFields`: Ensures that basic type fields are documented.

## Naming Conventions Validation

The following functions ensure that GraphQL naming conventions are followed:

| Function       | Allowed ✅                     | Not Allowed ❌                          |
|--------------|------------------------------|--------------------------------------|
| `isPascalCase` | `UserProfile`, `GraphQLType`  | `userProfile`, `_User`, `user_profile` |
| `isCamelCase`  | `userProfile`, `orderHistory` | `UserProfile`, `_userProfile`, `user_profile` |
| `isUpperCase`  | `PENDING`, `ORDER_STATUS`     | `Pending`, `order_status`, `PENDING-ORDER` |

### Explanation

- **`isPascalCase(name: string)`**  Ensures that the name starts with an uppercase letter and contains only letters and numbers.  
  ✅ **Valid:** `UserProfile`  
  ❌ **Invalid:** `userProfile`, `_User`, `user_profile`  

- **`isCamelCase(name: string)`**  
  Ensures that the name starts with a lowercase letter and contains only letters and numbers.  
  ✅ **Valid:** `userProfile`  
  ❌ **Invalid:** `UserProfile`, `_userProfile`, `user_profile`  

- **`isUpperCase(name: string)`**  
  Ensures that the name consists of only uppercase letters, numbers, and underscores.  
  ✅ **Valid:** `PENDING`, `ORDER_STATUS`  
  ❌ **Invalid:** `Pending`, `order_status`, `PENDING-ORDER`  

## Contributing

### Commit Message Guidelines

This project enforces a strict commit message format to maintain consistency and readability.

### **Commit Message Format**

Each commit message must follow this structure:

```
type(scope): message
```

Where:

- `type` must be one of: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`
- `scope` is **required** and should be a relevant topic or ticket number (e.g., `auth`, `TICKET-123`)
- `message` should be a short, descriptive summary of the changes

### **Examples**

✅ Valid commit messages:

```
feat(auth): add login API
fix(TICKET-456): resolve GraphQL error
chore(deps): update dependencies
```

❌ Invalid commit messages:

```
feat: add login API  # Missing scope
fix(Auth): Fix issue  # Wrong casing in scope
fix(ticket-123): bug fix  # Non-descriptive message
```

### **Commit Hook Enforcement**

A Git commit hook is used to validate commit messages before they are accepted.

Contributions to the `graphql-schema-policy-validator` are welcome! Feel free to submit issues, feature requests, or pull requests to help improve the project.
