import * as vscode from 'vscode'
import { loadSchema } from './loadSchema'
import { TypeScriptBuilder } from './typebuilder/typescript'

async function startup() {
  const nodes = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      cancellable: false,
      title: 'IGaT: Loading schema',
    },
    () => loadSchema()
  )

  return nodes.objects.map(node => ({
    label: node.name,
    node,
  }))
}

function initImport(): [vscode.TextEditor | null, string | null] {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showInformationMessage(
      'Must be in an active editor to import node'
    )
    return [null, null]
  }

  const allowedLanguages = {
    typescript: 'typescript',
    typescriptreact: 'typescript',
  }
  const lang = editor.document.languageId
  if (!(lang in allowedLanguages)) {
    vscode.window.showInformationMessage(`Language '${lang}' not supported`)
    return [null, null]
  }

  return [editor, lang]
}

export async function activate(context: vscode.ExtensionContext) {
  let nodes = await startup()

  const importNode = vscode.commands.registerCommand(
    'import-graphql-as-type.importNode',
    async () => {
      const [editor, language] = initImport()
      if (!editor || !language) return

      const obj = await vscode.window.showQuickPick(nodes)
      if (!obj) return

      const builder = new TypeScriptBuilder(obj.node)
      const typeString = builder.build()
      if (!typeString) return

      const document = editor.document
      editor.edit(editBuilder =>
        editor.selections.forEach(sel => {
          const range = sel.isEmpty
            ? document.getWordRangeAtPosition(sel.start) || sel
            : sel

          editBuilder.replace(range, typeString)
        })
      )
    }
  )

  const reloadSchema = vscode.commands.registerCommand(
    'import-graphql-as-type.reloadSchema',
    async () => {
      nodes = await startup()
    }
  )

  context.subscriptions.push(importNode)
  context.subscriptions.push(reloadSchema)
}

export function deactivate() {}
