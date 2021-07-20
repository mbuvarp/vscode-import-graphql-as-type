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
    console.log(this.parsedNode)
    return this.parsedNode.name
  }
}
