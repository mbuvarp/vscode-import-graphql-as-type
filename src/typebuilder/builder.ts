import * as vscode from 'vscode'
import { GraphQLField, GraphQLObjectType } from 'graphql'

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
  /** All nodes that have been parsed */
  protected parsedNodes: ParsedNode[] = []

  /** Keeps track of nodes which have been seen at least once */
  private seenNodeNames: string[] = []
  /** Set to true to skip further searching for unknown types */
  private skipSearch = false

  constructor(
    protected node: GraphQLObjectType,
    protected allNodes: GraphQLObjectType[]
  ) {}

  private static getType(field: GraphQLField<any, any>) {
    let typeString = field.type.inspect()
    const nullable = !typeString.endsWith('!')

    if (!nullable) typeString = typeString.substring(0, typeString.length - 1)

    let array = false
    const matched = typeString.match(/^\[(\w+)\]$/)
    if (matched !== null) {
      array = true
      typeString = matched[1]
    }

    return {
      typeString,
      nullable,
      array,
    }
  }

  private async loadNode(node: GraphQLObjectType): Promise<ParsedNode> {
    const nodeFields = Object.values(node.getFields())
    const fields: ParsedField[] = []

    for (const field of nodeFields) {
      const { typeString, nullable, array } = TypeBuilder.getType(field)
      const type = this.convertType(typeString, array)

      // If type is null, try searching for type in all nodes
      if (
        !this.skipSearch &&
        type === null &&
        type !== node.name &&
        !this.seenNodeNames.includes(typeString)
      ) {
        this.seenNodeNames.push(typeString)

        const answer = await vscode.window.showInputBox({
          title: `Search for "${typeString}"? (y/n)`,
          value: 'y',
          prompt: 'You can type "skip" to skip searching for unknown types.',
          validateInput: value =>
            value === 'y' || value === 'n' || value === 'skip'
              ? null
              : 'Must input "y", "n" or "skip"',
        })

        if (answer === 'skip') {
          this.skipSearch = true
        } else if (answer === 'y') {
          const found = this.allNodes.find(nd => nd.name === typeString)

          if (!found)
            vscode.window.showInformationMessage(
              `Could not find node '${typeString}'`
            )
          else {
            const loaded = await this.loadNode(found)
            this.parsedNodes.push(loaded)
          }
        }
      }

      const parsedField: ParsedField = {
        name: field.name,
        description: field.description || null,
        type: type ?? typeString,
        nullable,
      }
      fields.push(parsedField)
    }

    return {
      name: node.name,
      fields,
    }
  }

  public async load() {
    const loaded = await this.loadNode(this.node)
    this.parsedNodes.unshift(loaded)

    this.seenNodeNames = []
    this.skipSearch = false
  }

  public buildAll() {
    if (this.parsedNodes.length < 1)
      throw new Error(
        'You must call Builder.load (with await) before calling buildAll'
      )

    const nodes: string[] = []
    for (const node of this.parsedNodes) nodes.push(this.build(node))

    return nodes.join('\n\n')
  }

  abstract build(node: ParsedNode): string
  /**
   * Should return the language-specific normalization of the GraphQL type, or null.
   * If null is returned, the user will be asked if they want to search all nodes for this type.
   * @param type The input GraphQL type
   * @param array Signifies if type is an array
   */
  abstract convertType(type: string, array: boolean): string | null
}
