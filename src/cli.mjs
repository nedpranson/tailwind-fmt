#!/usr/bin/env node

'use strict'

// console.log(format(`<div class="bg-white">`))
// console.log(format(`<div class="bg-white\\\\\\""></div>`))
// console.log(format(`<div class='bg-white'></div>`))
// console.log(format(`<div class = "bg-white"></div>`))
// console.log(format(`<div class = "\\\\\\"bg-white \\"   text-black" class='flex'></div>`))
// console.log(format(`<button class="text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800">...</button>`))

import { readdir, stat } from "fs/promises"
import { join, resolve } from "path"
import { format } from "./format.mjs"
import { dir } from "console"

const args = process.argv.slice(2)
console.log(await resolveFiles(args))

/**
  * @param {string[]} paths
  * @returns string[]
  */
async function resolveFiles(paths) {
  const files = new Set()

  await Promise.all(paths.map(async (path) => {
    const absolute_path = resolve(path)
    const file_stat = await stat(absolute_path) // throws

    if (file_stat.isFile()) {
      files.add(absolute_path)
    }

    if (file_stat.isDirectory()) {
      const resolved = await resolveDir(absolute_path) // throws
      resolved.forEach((file) => files.add(file))
    }
  }))

  return Array.from(files)
}

/**
  * @param {string} absolute_path
  */
async function resolveDir(absolute_path) {
  const dirents = await readdir(absolute_path, { withFileTypes: true }) // throws

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
    const resolved = await Promise.all(dirs.map(resolveDir)) // throws
    files.push(...resolved.flat())
  }

  return files
}
