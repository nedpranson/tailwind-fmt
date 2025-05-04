'use strict'

import { resolveGetClassOrder } from './tailwindcss.mjs'

const getClassOrder = await resolveGetClassOrder(process.cwd())

// <div class="bg-white"></div>
// <div class="bg-white\""></div>
// <div class='bg-white'></div>
// <div class = "bg-white"></div>

/**
  * @param {string} content
  * @returns {string | null}
  */
export async function format(content) { // test?
  return null
}

function match() {
  // * class
  // * spaces
  // * =
  // * spaces
  // * quotes
  // * {}
  // * quotes
}
