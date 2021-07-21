import { GraphQLObjectType } from 'graphql'
import * as vscode from 'vscode'
import { loadSchema } from './loadSchema'
import { TypeBuilder } from './typebuilder/builder'
import { TypeScriptBuilder } from './typebuilder/typescript'

type SupportedLanguage = 'typescript'

async function startup() {
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

function initImport(): [vscode.TextEditor | null, SupportedLanguage | null] {
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

  const finalLang = allowedLanguages[
    lang as keyof typeof allowedLanguages
  ] as SupportedLanguage

  return [editor, finalLang]
}

function getBuilder(
  lang: SupportedLanguage,
  node: GraphQLObjectType,
  allNodes: GraphQLObjectType[]
): TypeBuilder {
  switch (lang) {
    case 'typescript':
      return new TypeScriptBuilder(node, allNodes)
  }
}

export async function activate(context: vscode.ExtensionContext) {
  let qpOptions = await startup()

  const importNode = vscode.commands.registerCommand(
    'import-graphql-as-type.importNode',
    async () => {
      const [editor, language] = initImport()
      if (!editor || !language) return

      const qpPick = await vscode.window.showQuickPick(qpOptions)
      if (!qpPick) return

      const allNodes = qpOptions.map(opt => opt.node)

      const builder = getBuilder(language, qpPick.node, allNodes)
      await builder.load()

      const typeString = builder.buildAll()
      if (!typeString) return

      // Insert text
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
      qpOptions = await startup()
    }
  )

  context.subscriptions.push(importNode)
  context.subscriptions.push(reloadSchema)
}

export function deactivate() {}
