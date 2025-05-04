#!/usr/bin/env node

'use strict'

import { format } from "./format.mjs"

format(`<div class="bg-white">`)
format(`<div class="bg-white\\\\\\""></div>`)
format(`<div class='bg-white'></div>`)
format(`<div class = "bg-white"></div>`)
format(`<div class = "\\\\\\"bg-white \\"   text-black" class='flex'></div>`)
format(`<button class="text-white px-4 sm:px-8 py-2 sm:py-3 bg-sky-700 hover:bg-sky-800">...</button>`)
