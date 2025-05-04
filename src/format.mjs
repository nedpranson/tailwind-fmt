'use strict'

import { resolveGetClassOrder } from './tailwindcss.mjs'

const getClassOrder = await resolveGetClassOrder(process.cwd()) // throws

/**
  * @param {string} content
  * @returns {{ start: number, end: number, formated: string }[]}
  */
export function format(content) {
  const result = []

  const it = matchIterator(content)
  while (true) {
    const match = it.next()
    if (!match) break

    const classes = match.split(/[\s]+/)
    if (classes.length == 0) continue

    const end = it.idx - 1
    const start = end - match.length

    console.log("before:", content.substring(start, end))
    console.log("after:", sort(getClassOrder(classes)))
  }

  return result
}


/**
  * @param {[ string, bigint | null ][]} class_order
  * @returns string
  */
function sort(class_order) {
  let result = ""

  const known = []
  let unknown = ""

  for (const item of class_order) {
    const [ className, order ] = item
    if (order !== null) {
      known.push(item)
      continue
    }

    const prefix = unknown.length == 0 ? "" : " "
    unknown += prefix + className
  }

  known.sort((a, b) => {
    return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0
  })

  for (const [ className ] of known) {
    const prefix = result.length == 0 ? "" : " "
    result += prefix + className
  }

  const join = result.length == 0 ? "" : " "
  return result + join + unknown
}

/**
  * @param {string} content
  * @returns {{ idx: number, next: () => string | null }}
  */
function matchIterator(content) {
  // * class
  // * spaces
  // * =
  // * spaces
  // * quote
  // * {}
  // * quote

  return { 
    idx: 0,
    next: function () {
      let idx = content.indexOf('class')
      if (idx == -1) {
        return null
      }

      idx += 5

      while (/\s/.test(content[idx])) { 
        if (idx++ == content.length) return null
      }

      if (content[idx++] !== '=') {
        return null
      }

      // out of index should not be a problem cuz we in js world
      while (/\s/.test(content[idx])) { 
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
      this.idx += idx

      const classes = content.substring(start, end)
      content = content.substring(idx)

      return classes
    }
  }
}
