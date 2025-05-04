'use strict'

import { resolveGetClassOrder } from './tailwindcss.mjs'

const getClassOrder = await resolveGetClassOrder(process.cwd()) // throws

// <div class="bg-white"></div>
// <div class="bg-white\""></div>
// <div class='bg-white'></div>
// <div class = "bg-white"></div>

/**
  * @param {string} content
  * @returns {string | null}
  */
export function format(content) { // todo: test
  const it = matchIterator(content)
  while (true) {
    const match = it.next()
    if (!match) break

    console.log(match)
  }

  return null
}

/**
  * @param {string} content
  * @returns {{ next: () => string | null }}
  */
function matchIterator(content) {
  // * class
  // * spaces
  // * =
  // * spaces
  // * quote
  // * {}
  // * quote

  return { next: () => {
    let idx = content.indexOf('class')
    if (idx == -1) {
      return null
    }

    idx += 5

    while (content[idx] === ' ' || content[idx] == '\t' || content[idx] == '\n') { 
      if (idx++ == content.length) return null
    }

    if (content[idx++] !== '=') {
      return null
    }

    // out of index should not be a problem cuz we in js world
    while (content[idx] === ' ' || content[idx] === '\t' || content[idx] === '\n') { 
      if (idx++ == content.length) return null
    }

    const quote = content[idx++]
    if (quote !== '"' && quote !== "'") return null

    const start = idx

    outer: while (true) {
      while (content[idx] !== quote) {
        if (idx++ == content.length) return null
      }

      if (quote == "'") break

      // checking if quote is escaped
      for (let i = idx - 1; i >= start; i--) {
        if (content[i] === '\\') continue
        const n = idx - i - 1

        if (n % 2 == 0) {
          break outer;
        }
        break
      }
      idx++
    }

    const end = idx++

    const classes = content.substring(start, end)
    content = content.substring(idx)

    return classes
  } }
}
