import * as vscode from 'vscode'
import { readFileSync } from 'fs'

export async function getConfigFile() {
  const files = await vscode.workspace.findFiles('**/.igat.config.json')
  if (files.length === 0) {
    vscode.window.showWarningMessage(
      "No config file found. Please add the file '.igat.config.json' in your project's root directory"
    )
    return null
  }

  const contents = readFileSync(files[0].fsPath, 'utf-8')

  try {
    const config = JSON.parse(contents)
    if (typeof config !== 'object')
      throw new Error('Config file JSON is not an object')

    return config
  } catch {
    vscode.window.showWarningMessage(
      'Could not parse .igat.config.json - is it formatted correctly?'
    )
    return null
  }
}

export async function getConfigSetting<T = any>(
  setting: string,
  options: {
    showError?: boolean
    validator?: (setting: any) => boolean
  } = {}
): Promise<T | null> {
  const config = await getConfigFile()
  if (!config) return null

  const value = config[setting]
  if (typeof value === 'undefined') {
    if (!!options.showError)
      vscode.window.showWarningMessage(
        `Setting "${setting}" not found in config`
      )

    return null
  }

  if (!!options.validator && !options.validator(value)) return null

  return value as T
}
