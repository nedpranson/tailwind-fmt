import { test } from "uvu"
import * as assert from "uvu/assert"
import { matchIterator } from "../src/format.mjs"

// todo: handle "class=\"escpaed quotes\""

test("match iterator", () => {
  const cases = [
    { 
      data: `<button class="text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800">...</button>`,
      matches: [ "text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800" ]
    },

    {
      data: `<div class="\\"" class="\\\\\\"" class="\\\\">...</div>`,
      matches: [
        "\\\"",
        "\\\\\\\"",
        "\\\\",
      ],
    },

    {
      data: `<div class="prefix \\" suffix" class="prefix \\\\\\" suffix" class="prefix \\\\ suffix">...</div>`,
      matches: [
        "prefix \\\" suffix",
        "prefix \\\\\\\" suffix",
        "prefix \\\\ suffix",
      ],
    },

    {
      data: `<div class\r\n   =\t   \r\n "white spaces">...</div>`,
      matches: [ "white spaces" ],
    },

    {
      data: `<divclass="white spaces">...</div>`,
      matches: [],
    },

    {
      data: `<div class="" class=" ">...</div>`,
      matches: [
        "", 
        " "
      ],
    },

    {
      data: `<div class\t=\t'opened class='bg-white'">...</div>`,
      matches: [ "opened class=" ],
    },

    {
      data: `<div class\r=\t'hello">...</div>`,
      matches: [],
    },

    {
      data: `<div class="">...</div>`,
      matches: [ "" ],
    },

    {
      data: `<div CLASS="uppercase">...</div>`,
      matches: [],
    },

    {
      data: `<div class="class" classb="classb">...</div>`,
      matches: [ "class" ],
    },

    {
      data: `<div class="both" class="valid">...</div>`,
      matches: [ 
        "both",
        "valid",
      ],
    },

    {
      data: `<div class class="valid">...</div>`,
      matches: [ "valid" ],
    },

    {
      data: `<div class== class="valid"">...</div>`,
      matches: [ "valid" ],
    },

    {
      data: `<div class=/" class="valid" id="1""">...</div>`,
      matches: [ "valid" ],
    },

    {
      data: `<div class=/"class="not valid" id="1""">...</div>`,
      matches: [],
    },

    {
      data: `<div class="class='not valid'">...</div>`,
      matches: [ "class='not valid'" ],
    },

    {
      data: `<div class="text-red-500 \\"bg-blue\\">">...</div>`,
      matches: [ "text-red-500 \\\"bg-blue\\\">" ],
    },
  ]

  for (const { data, matches } of cases) {
    const it = matchIterator(data)
    for (const match of matches) {
      assert.equal(it.next(), match)
    }
    assert.is(it.next(), null)
    assert.is(it.next(), null)
  }
})

test.run()
