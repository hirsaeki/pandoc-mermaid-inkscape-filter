#!/usr/bin/env node

const fs = require('fs');
const pf = require('pandoc-filter');
const shx = require('shelljs');
const tmp = require('tmp');
const rm = require('rimraf');
const mermaid = require('mermaid/src/mermaidAPI').default;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM(`<!DOCTYPE html>`);
const $ = require('jquery')(window);

const mermaidInkscapeFilter = (type, value) => {
    // Not a CodeBlock -> skip.
    if (type !== 'CodeBlock') return null;

    const cls = value[0][1]; // TODO find out the structure behind this.
    // Not a mermaid code block -> skip.
    if (0 > cls.indexOf('mermaid')) return null;

    const code = value[1];
   
    mermaid.initialize({
            startOnLoad:true
        });
        $(function(){
              var cb = function(svgGraph) {
                const mfile = tmp.fileSync({ postfix: '.svg' });
               fs.writeSync(mfile, code);
              };
            mermaidAPI.render('id1',code,cb);
        );

    return pf.Div(['',[],[]], [
        pf.Image(['image.png',[],[]],[])
    ]);
}

pf.toJSONFilter(mermaidInkscapeFilter);