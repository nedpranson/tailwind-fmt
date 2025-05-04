#!/usr/bin/env node

'use strict'

import { format } from "./format.mjs"

format(`<div class="bg-white">`)
format(`<div class="bg-white\\\\\\""></div>`)
format(`<div class='bg-white'></div>`)
format(`<div class = "bg-white"></div>`)
format(`<div class = "\\\\\\"bg-white \\" text-black" class='flex'></div>`)
