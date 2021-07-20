import * as vscode from 'vscode'
import { loadSchema } from './loadSchema'
import { TypeScriptBuilder } from './typebuilder/typescript'

async function startup() {
  const nodes = await loadSchema()

  return nodes.objects.map(node => ({
    label: node.name,
    node,
  }))
}

export async function activate(context: vscode.ExtensionContext) {
  const nodes = await startup()

  let disposable = vscode.commands.registerCommand(
    'import-graphql-as-type.reloadSchema',
    async () => {
      const obj = await vscode.window.showQuickPick(nodes)
      if (!obj) return

      const builder = new TypeScriptBuilder(obj.node)
      console.log(builder.build())
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
