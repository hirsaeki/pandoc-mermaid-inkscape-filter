import test from 'ava'

import { toJSONFilter } from 'pandoc-filter-async'
import { filter } from './index'
import { existsSync } from 'fs'

test(async t => {
    const value = [
        ['', 'mermaid'],
        'sequenceDiagram\n  participant A\n  participant B'
    ]
    const result = await filter('CodeBlock', value)
    t.true(existsSync(`${__dirname}/images/fe3ead09f3994885504a5efd498336af80d42d8a.svg`))
})
