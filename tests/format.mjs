import { test } from "uvu"
import * as assert from "uvu/assert"
import { matchIterator } from "../src/format.mjs"

test("match iterator", () => {
  const cases = [
    { 
      data: `<button class="text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800">...</button>`,
      matches: [ "text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800" ]
    },

    {
      data: `<div class="\\"" class="\\\\\\"">...</div>`,
      matches: [
        "\\\"",
        "\\\\\\\"",
      ]
    },

    {
      data: `<div class\r\n   =\t   \r\n "white spaces">...</div>`,
      matches: [ "white spaces" ]
    },

    {
      data: `<div class\t=\t'opened class='bg-white'">...</div>`,
      matches: [ "opened class=" ]
    },

    {
      data: `<div class\r=\t'hello">...</div>`,
      matches: [ null ]
    },

    {
      data: `<div class="">...</div>`,
      matches: [ null ]
    },

    {
      data: `<div CLASS="uppercase">...</div>`,
      matches: [ null ]
    },

    {
      data: `<div class="class" classb="classb">...</div>`,
      matches: [ "class" ]
    },

    {
      data: `<div class="both" class="valid">...</div>`,
      matches: [ 
        "both",
        "valid",
      ]
    },

    {
      data: `<div class class="valid">...</div>`,
      matches: [ "valid" ]
    },
  ]

  for (const { data, matches } of cases) {
    const it = matchIterator(data)
    for (const match of matches) {
      assert.equal(it.next(), match)
    }
    assert.is(it.next(), null)
  }
})

test.run()
