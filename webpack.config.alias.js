/**
 * @file 添加webpack alias，支持
 * @type {module:path}
 */
const alias = require('./scripts/alias');

module.exports = {
  resolve: {
    alias,
  }
};
