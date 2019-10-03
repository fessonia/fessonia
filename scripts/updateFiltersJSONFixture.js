const path = require('path');
const fs = require('fs')

const FilterNode = require(path.resolve(__dirname, '../lib/filter_node'))
const filters = FilterNode._getValidFilterInfoFromFFmpeg()

fs.writeFileSync('./test/fixtures/ffmpeg-filters.json', JSON.stringify(filters, null, 2), {})
