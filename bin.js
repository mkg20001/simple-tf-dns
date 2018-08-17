'use strict'

/* eslint-disable no-console */

const {processFile} = require('.')

const fs = require('fs')
const read = (file) => String(fs.readFileSync(file))
const domain = process.argv[2]

console.log(processFile(domain, read, domain) + (fs.existsSync(domain + '.extra') ? read(domain + '.extra') : ''))
