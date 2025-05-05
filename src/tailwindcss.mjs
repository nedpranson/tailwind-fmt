"use strict"

import { createRequire } from "module"
import { dirname, relative } from "path"
import { pathToFileURL } from "url"
import { readFile } from "fs/promises"
import postcss from "postcss"
import postcssImport from "postcss-import"
import { _try } from "./shared.mjs"
import { strerror } from "./errno.mjs"

// todo: handle them errors

/**
  * @param {string} base_path 
  * @param {string?} stylesheet_path 
  * @returns {Promise<(classNames: string[]) => [ string, bigint | null ][]>}
  */
export async function resolveGetClassOrder(base_path, stylesheet_path) {
  const tw_path = _try(() => dirname(resolve("tailwindcss/package.json", [base_path])), () => {
    console.error("error: tailwindcss is not installed.")
    process.exit(1)
  })

  const theme_path = stylesheet_path || tw_path + "/theme.css"

  const tw_file = _try(() => resolve("tailwindcss", [base_path]), () => {
    console.error("error: tailwindcss is outdated, update to version 4.1.5 or higher.");
    process.exit(1)
  })

  const tw = (await import(pathToFileURL(tw_file).toString())).default // can throw

  if (!tw.__unstable__loadDesignSystem) {
    console.error("error: tailwindcss is outdated, update to version 4.1.5 or higher.");
    process.exit(1)
  }

  const css = await readFile(theme_path, "utf8").catch((reason) => {
    console.error(`error: '${relative(base_path, stylesheet_path)}': ${strerror[reason.errno]}.`)
    process.exit(1)
  })

  // todo: we need to handle error here

  const resolve_imports = postcss([postcssImport()])
  const result = await resolve_imports.process(css, { from: theme_path })

  const design = await tw.__unstable__loadDesignSystem(result.css, {
    loadPlugin() {
      return () => {}
    },
  })

  return (classNames) => {
    return design.getClassOrder(classNames) // todo: check if getCLassOrder is defined
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
