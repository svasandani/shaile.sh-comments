const { MongoClient, ObjectId } = require('mongodb');
const api = require('./api');

module.exports = {
  connect: () => new Promise((resolve, reject) => {
    MongoClient.connect(process.env.DATABASE_CONN_STR, {
      useUnifiedTopology: true
    })
    .then(client => {
      api.init(client, ObjectId);
      resolve(client)
    })
    .catch(err => reject(err));
  })
}

/*
  {
    'path': 'pathname of page',
    'name': 'name of user',
    'email': 'email of user',
    'title': 'title of comment',
    'body': 'body of comment'
  }
*/