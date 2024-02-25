const { Pool } = require('pg');

const pool = new Pool({
    user: 'ecommerce_2apz_user',
    host: 'dpg-cnd53led3nmc738jn2a0-a.singapore-postgres.render.com',
    database: 'ecommerce_2apz',
    password: 'jOObwwOgw3COPML0lCnwChAROC0v79j0',
    port: 5432,
    ssl : true
  });

  module.exports = pool ;