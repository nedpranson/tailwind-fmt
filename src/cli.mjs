#!/usr/bin/env node

'use strict'

import { format } from "./format.mjs"

console.log(format(`<div class="bg-white">`))
console.log(format(`<div class="bg-white\\\\\\""></div>`))
console.log(format(`<div class='bg-white'></div>`))
console.log(format(`<div class = "bg-white"></div>`))
console.log(format(`<div class = "\\\\\\"bg-white \\"   text-black" class='flex'></div>`))
console.log(format(`<button class="text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800">...</button>`))
