// import * as vscode from 'vscode'
import { loadSchema as load } from '@graphql-tools/load'
import { UrlLoader } from '@graphql-tools/url-loader'
import { GraphQLInterfaceType } from 'graphql'

const schemaUrl = 'http://localhost:8000/graphql'

export async function loadSchema() {
  const schema = await load(schemaUrl, {
    loaders: [new UrlLoader()],
  })

  const nodes = schema.getImplementations(
    new GraphQLInterfaceType({
      name: 'Node',
      fields: {},
    })
  )

  return nodes
}
