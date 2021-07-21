import * as vscode from 'vscode'
import { loadSchema } from '../loadSchema'

export async function startup() {
  const nodes = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      cancellable: false,
      title: 'IGaT: Loading schema',
    },
    () => loadSchema()
  )
  if (!nodes) return []

  return nodes.objects.map(node => ({
    label: node.name,
    node,
  }))
}
