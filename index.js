require('dotenv').config()

const app = require('./app');
const db = require('./db');
const routes = require('./routes');

db.connect()
  .then(client => {
    console.log('Database connection established.');

    app.listen(process.env.PORT || 3000, () => {
      console.log(`listening on ${process.env.PORT || 3000}`);
    });
    
    routes.forEach(route => {
      app[route.method](route.url, (req, res) => {
        if (route.protected) {
          if (!req.headers.authorization) {
            res.status(406).send('No authorization provided');
            return;
          }
      
          if (req.headers.authorization !== process.env.SUPER_SECRET_API_KEY) {
            res.status(403).send('Incorrect API key');
            return;
          }
        }

        route.handler(req, res);
      });
    });
  })
  .catch(err => {
    console.error(err);
  });