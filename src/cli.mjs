#!/usr/bin/env node

"use strict"

import { join, relative, resolve } from "path"
import { readdir, stat, readFile } from "fs/promises"
import { createWriteStream } from "fs"
import { resolveGetClassOrder } from "./tailwindcss.mjs"
import { format } from "./format.mjs"
import { strerror } from "./errno.mjs"
import { _try } from "./shared.mjs"

const args = process.argv.slice(2)

const sources = []
let stylesheet_path = null

if (args.length === 0) {
  console.log("usage: npx tailwind-fmt [--input input.css] [files...].")
  process.exit(0)
}

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--input") {
    const path = args[++i]
    if (path === undefined) {
      console.error("error: option '--input' requires an argument.")
      process.exit(1)
    }

    stylesheet_path = resolve(path)
    continue
  }
  sources.push(args[i])
}

if (sources.length === 0) {
  console.error("error: expected at least one source file argument.")
  process.exit(1)
}

const files = await resolveFiles(sources) // handled
const get_class_order = await resolveGetClassOrder(process.cwd(), stylesheet_path) // throws

await Promise.all(files.map(async (absolute_path) => { // we need to limit the async work
  const content = await readFile(absolute_path, "utf8").catch((reason) => {
    console.error(`error: '${relative(process.cwd(), absolute_path)}': ${strerror[reason.errno]}.`)
    process.exit(1)
  })

  const matches = format(content, get_class_order)
  if (matches.length == 0) {
    return
  }

  const out = _try(() => createWriteStream(absolute_path, { encoding: "utf8" }), (reason) => {
      console.error(`error: '${relative(process.cwd(), absolute_path)}': ${strerror[reason.errno]}.`)
      process.exit(1)
  })

  const { promise, resolve } = withResolvers()

  out.on("finish", () => {
    console.log(relative(process.cwd(), absolute_path))
    resolve()
  })

  out.on("error", (reason) => { // not all errors can have errno
    console.error(`error: '${relative(process.cwd(), absolute_path)}': ${strerror[reason.errno]}.`)
    process.exit(1)
  })

  let idx = 0
  matches.forEach(({ start, end, formatted }) => {
    out.write(content.slice(idx, start))
    out.write(formatted)
    idx = end
  })

  out.write(content.slice(idx))
  out.end()

  return promise
}))

// todo: add like async pool with like idk 16 idk workers

/**
  * @param {string[]} paths
  * @returns string[]
  */
async function resolveFiles(paths) {
  const files = new Set()

  await Promise.all(paths.map(async (path) => {
    const absolute_path = resolve(path)
    const file_stat = await stat(absolute_path).catch((reason) => {
      console.error(`error: '${relative(process.cwd(), absolute_path)}': ${strerror[reason.errno]}.`)
      process.exit(1)
    })

    if (file_stat.isFile()) {
      files.add(absolute_path)
    }

    if (file_stat.isDirectory()) {
      const resolved = await resolveDir(absolute_path) // handled 
      resolved.forEach((file) => files.add(file))
    }
  }))

  return Array.from(files)
}

/**
  * @param {string} absolute_path
  */
async function resolveDir(absolute_path) {
  const dirents = await readdir(absolute_path, { withFileTypes: true }).catch((reason) => {
      console.error(`error: '${relative(process.cwd(), absolute_path)}': ${strerror[reason.errno]}.`)
      process.exit(1)
  })

  const files = []
  const dirs = []

  for (const dirent of dirents) {
    if (dirent.isFile()) {
      files.push(join(absolute_path, dirent.name))
    }

    if (dirent.isDirectory()) {
      dirs.push(join(absolute_path, dirent.name))
    }
  }

  if (dirs.length !== 0) {
    const resolved = await Promise.all(dirs.map(resolveDir)) // handled
    files.push(...resolved.flat())
  }

  return files
}

/**
  * @template T
  * @returns {{ promise: Promise<T>, resolve: (val: T | PromiseLike<T>) => void, reject: (reason?: any) => void }}
  */
function withResolvers() {
  let resolve
  let reject

  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}
