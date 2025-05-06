"use strict"

/**
  * @param {string} content
  * @param {(classNames: string[]) => [ string, bigint | null ][]} get_class_order 
  * @returns {{ start: number, end: number, formatted: string }[]}
  */
export function format(content, get_class_order) {
  const result = []

  const it = matchIterator(content)
  while (true) {
    const match = it.next()
    if (!match) break

    const classes = match.split(/[\s]+/)
    if (classes.length === 0) continue

    const end = it.idx - 1
    const start = end - match.length

    const formatted = sort(get_class_order(classes))
    const changed = !formatted.split(/[\s]+/).every((v, i) => v == classes[i])

    changed && result.push({
      start,
      end,
      formatted
    })
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

  const join = (result.length === 0 || unknown.length === 0) ? "" : " "
  return result + join + unknown
}

/**
  * @param {string} content
  * @returns {{ idx: number, next: () => string | null }}
  */
export function matchIterator(content) { // we need to test this uvu?
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
      // todo: fix bad returns we should try finding till we can
      let idx = content.indexOf("class")
      if (idx == -1) {
        return null
      }

      idx += 5

      while (/\s/.test(content[idx])) { 
        if (idx++ == content.length) return null
      }

      if (content[idx++] !== "=") {
        // bad return
        return null
      }

      // out of index should not be a problem cuz we in js world
      while (/\s/.test(content[idx])) { 
        if (idx++ == content.length) return null
      }

      const quote = content[idx++]
      // bad return
      if (quote !== '"' && quote !== "'") return null // should we handle \" class=\"text-white\"

      const start = idx

      outer: while (true) {
        while (content[idx] !== quote) {
          if (idx++ == content.length) return null
        }

        if (quote == "'") break

        // checking if quote is escaped
        for (let i = idx - 1; i >= start; i--) {
          if (content[i] === "\\") continue
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

      const classes = content.slice(start, end)
      content = content.slice(idx)

      return classes
    }
  }
}
