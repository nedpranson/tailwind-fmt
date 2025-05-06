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
export function matchIterator(content) {
  return { 
    idx: 0,
    next: function () {
      while (true) {
        let idx = content.indexOf("class")
        if (idx === -1) {
          return (content = "", null)
        }

        if (idx !== 0 && !isWhitespace(content[idx - 1])) {
          this.idx += 4
          content = content.slice(idx + 4)

          continue
        }

        idx += 5

        while (isWhitespace(content[idx])) { 
          if (idx++ === content.length) return (content = "", null)
        }

        const equal = content[idx++]
        if (idx === content.length) {
          return (content = "", null)
        }

        if (equal !== "=") {
          this.idx += idx - 1
          content = content.slice(idx - 1)

          continue
        }

        while (isWhitespace(content[idx])) { 
          if (idx++ === content.length) return (content = "", null)
        }

        const quote = content[idx++]
        if (idx === content.length) {
          return (content = "", null)
        }

        if (quote !== '"' && quote !== "'") {
          this.idx += idx - 1
          content = content.slice(idx - 1)

          continue
        }

        const start = idx

        outer: while (true) {
          while (content[idx] !== quote) {
            if (idx++ === content.length) return (content = "", null)
          }

          if (quote == "'") break

          // checking if quote is escaped
          for (let i = idx; i >= start; i--) {
            if (content[i - 1] === "\\") continue
            const n = idx - i - 2

            if (n % 2 === 0) {
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
}


/**
  * @param {string} c
  * @return {boolean}
  */
function isWhitespace(c) {
  return c === " " || (c >= "\t" && c <= "\r")
}
