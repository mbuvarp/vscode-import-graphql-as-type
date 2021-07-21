import { GraphQLObjectType } from 'graphql'
import * as vscode from 'vscode'
import { TypeBuilder } from '../typebuilder/builder'
import { TypeScriptBuilder } from '../typebuilder/typescript'

type SupportedLanguage = 'typescript'

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
    default:
      throw new Error('Unsupported language')
  }
}

export async function importNode(
  qpOptions: {
    label: string
    node: GraphQLObjectType
  }[]
) {
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
