
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./react-image-pan-zoom-rotate.cjs.production.min.js')
} else {
  module.exports = require('./react-image-pan-zoom-rotate.cjs.development.js')
}
