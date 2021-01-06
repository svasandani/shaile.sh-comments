require('dotenv').config()

const app = require('./app');
const db = require('./db');
const routes = require('./routes');

db.connect()
  .then(client => {
    console.log('Database connection established.');

    app.listen(3000, () => {
      console.log('listening on 3000');
    });
    
    routes.forEach(route => {
      app[route.method](route.url, route.handler);
    });
  })
  .catch(err => {
    console.error(err);
  });