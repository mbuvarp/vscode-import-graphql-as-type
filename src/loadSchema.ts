import * as vscode from 'vscode'
import { loadSchema as load } from '@graphql-tools/load'
import { UrlLoader } from '@graphql-tools/url-loader'
import { GraphQLInterfaceType } from 'graphql'
import { getConfigSetting } from './util/config'

export async function loadSchema() {
  const url = await getConfigSetting('host', {
    showError: true,
  })
  if (!url) return null

  try {
    const schema = await load(url, {
      loaders: [new UrlLoader()],
    })

    const nodes = schema.getImplementations(
      new GraphQLInterfaceType({
        name: 'Node',
        fields: {},
      })
    )

    return nodes
  } catch {
    vscode.window.showErrorMessage('IGaT: Could not load schema')
    return null
  }
}
