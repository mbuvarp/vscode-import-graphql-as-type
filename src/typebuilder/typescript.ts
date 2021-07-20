import { TypeBuilder } from './abstract'

export class TypeScriptBuilder extends TypeBuilder {
  convertType(type: string) {
    switch (type) {
      case 'ID':
      case 'String':
      case 'Date':
      case 'DateTime':
      case 'Time':
      case 'TimeDelta':
      case 'JSONString':
      case 'Base64':
        return 'string'

      case 'Int':
      case 'Float':
      case 'Decimal':
        return 'number'

      case 'Boolean':
        return 'boolean'

      default:
        return type
    }
  }

  build() {
    const fields = this.parsedNode.fields.map(field => {
      let ret = '  '
      ret += field.name + ': '
      ret += field.type
      ret += field.nullable ? ' | null' : ''

      if (!!field.description) ret = '  /* ' + field.description + ' */\n' + ret

      return ret
    })

    return `export interface ${this.parsedNode.name} {
${fields.join('\n')}
}`
  }
}
