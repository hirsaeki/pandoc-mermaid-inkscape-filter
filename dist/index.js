#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const pf = require('pandoc-filter-async');
// const shx = require('shelljs')
// const tmp = require('tmp')
const puppeteer = require('puppeteer');
const path = require('path');
const crypto = require('crypto');

const magic = (() => {
  var _ref = _asyncToGenerator(function* (definition, filename) {
    const browser = yield puppeteer.launch();
    const page = yield browser.newPage();
    const width = 300;
    const height = 300;
    page.setViewport({ width, height });
    yield page.goto(`file://${path.join(__dirname, 'index.html')}`);

    const theme = 'forest';
    const output = `${__dirname}/images/${filename}.svg`;

    // const definition = fs.readFileSync(input, 'utf-8')
    yield page.$eval('#container', function (container, definition, theme) {
      container.innerHTML = definition;
      window.mermaid_config = { theme };
      window.mermaid.init(undefined, container);
    }, definition, theme);

    if (output.endsWith('svg')) {
      const svg = yield page.$eval('#container', function (container) {
        return container.innerHTML;
      });
      fs.writeFileSync(output, svg);
    } else {
      // png
      const clip = yield page.$eval('svg', function (svg) {
        const rect = svg.getBoundingClientRect();
        return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
      });
      yield page.screenshot({ path: output, clip });
    }

    browser.close();
  });

  return function magic(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

const filter = exports.filter = (() => {
  var _ref2 = _asyncToGenerator(function* (type, value) {
    // Not a CodeBlock -> skip.
    if (type !== 'CodeBlock') return null;

    const cls = value[0][1]; // TODO find out the structure behind this.
    // Not a mermaid code block -> skip.
    if (cls.indexOf('mermaid') < 0) return null;
    const code = value[1];

    // DO MAGIC
    const filename = crypto.createHash('sha1').update(code, 'utf-8').digest('hex');
    yield magic(code, filename);

    // return pf.Para([
    return pf.Image(['', [], []], [], [`${__dirname}/images/${filename}.svg`, '']);
    // ])
  });

  return function filter(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

pf.toJSONFilter(filter);
