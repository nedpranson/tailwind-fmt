'use strict'

import { createRequire } from 'module'
import { dirname } from 'path'
import { pathToFileURL } from 'url'
import { readFile } from 'fs/promises'
import postcss from 'postcss'
import postcssImport from 'postcss-import'

/**
  * @param {string} base_path 
  * @returns {Promise<(classNames: string[]) => [ string, number | null ][]>}
  */
export async function resolveGetClassOrder(base_path) { // how do we even catch errors in js?
  const tw_path = dirname(resolve('tailwindcss/package.json', [base_path])) // can throw
  const tw_file = resolve('tailwindcss', [base_path]) // can throw

  const tw = (await import(pathToFileURL(tw_file).toString())).default // can throw

  if (!tw.__unstable__loadDesignSystem) {
    throw "invalid tailwindcss version"
  }

  const css = await readFile(tw_path + '/theme.css', 'utf8') // can throw
  const resolve_imports = postcss([postcssImport()])
  const result = await resolve_imports.process(css, { from: tw_path + '/theme.css' })

  const design = await tw.__unstable__loadDesignSystem(result.css, {
    loadPlugin() {
      return () => {}
    },
  })

  return (classNames) => {
    return design.getClassOrder(classNames)
  }
}

/**
  * @param {string} id
  * @param {string[]} paths
  * @returns {NodeJS.Require}
  */
function resolve(id, paths) {
  return createRequire(import.meta.url).resolve(id, { paths })
}
