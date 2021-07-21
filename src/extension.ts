import * as vscode from 'vscode'
import { importNode } from './commands/importNode'
import { startup } from './commands/reloadSchema'

export async function activate(context: vscode.ExtensionContext) {
  let qpOptions = await startup()

  const importNodeCommand = vscode.commands.registerCommand(
    'import-graphql-as-type.importNode',
    () => importNode(qpOptions)
  )

  const reloadSchemaCommand = vscode.commands.registerCommand(
    'import-graphql-as-type.reloadSchema',
    async () => {
      qpOptions = await startup()
    }
  )

  context.subscriptions.push(importNodeCommand)
  context.subscriptions.push(reloadSchemaCommand)
}

export function deactivate() {}
