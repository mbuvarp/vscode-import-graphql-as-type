import { GraphQLObjectType } from 'graphql'

export interface ParsedField {
  name: string
  description: string | null
  type: string
  nullable: boolean
}

export interface ParsedNode {
  name: string
  fields: ParsedField[]
}

export abstract class TypeBuilder {
  protected parsedNode: ParsedNode

  constructor(node: GraphQLObjectType<any, any>) {
    this.parsedNode = this.load(node)
  }

  private load(node: GraphQLObjectType<any, any>): ParsedNode {
    const fields: ParsedField[] = Object.entries(node.getFields()).map(
      ([, value]) => {
        let typeString = value.type.inspect()
        const nullable = !typeString.endsWith('!')

        if (!nullable)
          typeString = typeString.substring(0, typeString.length - 1)

        const field: ParsedField = {
          name: value.name,
          description: value.description || null,
          type: this.convertType(typeString),
          nullable,
        }

        return field
      }
    )

    return {
      name: node.name,
      fields,
    }
  }

  abstract build(): string
  abstract convertType(type: string): string
}
