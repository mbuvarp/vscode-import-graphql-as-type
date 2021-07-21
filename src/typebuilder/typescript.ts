import { ParsedNode, TypeBuilder } from './builder'

export class TypeScriptBuilder extends TypeBuilder {
  convertType(type: string, array: boolean) {
    const arraySuffix = array ? '[]' : ''

    switch (type) {
      case 'ID':
      case 'String':
      case 'Date':
      case 'DateTime':
      case 'Time':
      case 'TimeDelta':
      case 'JSONString':
      case 'Base64':
        return 'string' + arraySuffix

      case 'Int':
      case 'Float':
      case 'Decimal':
        return 'number' + arraySuffix

      case 'Boolean':
        return 'boolean' + arraySuffix

      default:
        return null
    }
  }

  build(node: ParsedNode) {
    const fields = node.fields.map(field => {
      let ret = '  '
      ret += field.name + ': '
      ret += field.type
      ret += field.nullable ? ' | null' : ''

      if (!!field.description) ret = '  /* ' + field.description + ' */\n' + ret

      return ret
    })

    return `export interface ${node.name} {
${fields.join('\n')}
}`
  }
}
