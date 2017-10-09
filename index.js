#!/usr/bin/env node

const Sync = require('sync')
const fs = require('fs')
const pf = require('pandoc-filter-async')
// const shx = require('shelljs')
// const tmp = require('tmp')
const puppeteer = require('puppeteer')
const path = require('path')
const crypto = require('crypto')

const magic = async (definition, filename) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const width = 300
  const height = 300
  page.setViewport({ width, height })
  await page.goto(`file://${path.join(__dirname, 'index.html')}`)

  const theme = 'forest'
  const output = `${__dirname}\\images\\${filename}.svg`

  // const definition = fs.readFileSync(input, 'utf-8')
  await page.$eval('#container', (container, definition, theme) => {
    container.innerHTML = definition
    window.mermaid_config = { theme }
    window.mermaid.init(undefined, container)
  }, definition, theme)

  if (output.endsWith('svg')) {
    const svg = await page.$eval('#container', container => container.innerHTML)
    fs.writeFileSync(output, svg)
  } else { // png
    const clip = await page.$eval('svg', svg => {
      const rect = svg.getBoundingClientRect()
      return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
    })
    await page.screenshot({ path: output, clip })
  }

  browser.close()
}

export const filter = (type, value) => {
    // Not a CodeBlock -> skip.
  if (type !== 'CodeBlock') return null

  const cls = value[0][1] // TODO find out the structure behind this.
    // Not a mermaid code block -> skip.
  if (cls.indexOf('mermaid') < 0) return null
  const code = value[1]

    // DO MAGIC
  const filename = crypto.createHash('sha1').update(code, 'utf-8').digest('hex')
  Sync(() => {
    magic(code, filename)
  })

  // return pf.Para([
  return pf.Image(
      ['', [], []],
      [],
      [`${__dirname}\\images\\${filename}.svg`, ''])
  // ])
}

pf.toJSONFilter(filter)
