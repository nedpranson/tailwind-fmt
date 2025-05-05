"use strict"

/**
  * @template T
  * @param {() => T} f
  * @param {(reason?: any) => T} on_error
  */
export function _try(f, on_error) {
  try {
    return f()
  } catch (reason) {
    return on_error(reason)
  }
}
