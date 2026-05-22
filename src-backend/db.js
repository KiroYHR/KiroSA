const knex = require('knex');
const knexfile = require('../knexfile');

// Khởi tạo kết nối dùng cấu hình development
const db = knex(knexfile.development);

module.exports = db;