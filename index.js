require('dotenv').config()

const express = require('express');
const app = express();
app.use(express.json());

const { MongoClient, ObjectId } = require('mongodb');

MongoClient.connect(process.env.DATABASE_CONN_STR, {
  useUnifiedTopology: true
})
  .then(client => {
    console.log('Connected to database');
    const db = client.db('comments')
    const commentCollection = db.collection('comments');

    app.get('/comments', (req, res) => {      
      const cursor = commentCollection.find();
      cursor.toArray()
        .then(data => res.send(data));
    });

    app.get('/mod', (req, res) => {      
      const cursor = commentCollection.find(
        {
          published: false
        }
      );
      cursor.toArray()
        .then(data => res.send(data));
    });

    app.get('/comments/:path', (req, res) => {
      if (!req.params.path) {
        res.status(406);
        res.send('Please specify a path');
      }
      
      const cursor = commentCollection.find(
        {
          path: req.params.path,
          published: true
        }
      );
      cursor.toArray()
        .then(data => res.send(data));
    });

    /*
      {
        'path': 'pathname of page',
        'name': 'name of user',
        'email': 'email of user',
        'title': 'title of comment',
        'body': 'body of comment'
      }
    */
    app.post('/comment', (req, res) => {
      if (!req.body.path || !req.body.name || !req.body.email || !req.body.title || !req.body.body) res.status(406).send('Missing data');

      const data = req.body;
      data.published = false;

      commentCollection.insertOne(req.body)
        .then(result => {
        })
        .catch(error => console.error(error));
      
      res.status(200).send('Success');
    });

    app.put('/publish', (req, res) => {
      if (!req.body.id) res.status(406).send('Missing data');

      commentCollection.findOneAndUpdate(
        {
          _id: ObjectId(req.body.id)
        },
        {
          $set: {
            published: true
          }
        },
        {}
      )
        .then(result => res.status(200).send('Success'))
        .catch(error => console.error(error));
    });

    app.put('/unpublish', (req, res) => {
      if (!req.body.id) res.status(406).send('Missing data');

      commentCollection.findOneAndUpdate(
        {
          _id: ObjectId(req.body.id)
        },
        {
          $set: {
            published: false
          }
        },
        {}
      )
        .then(result => res.status(200).send('Success'))
        .catch(error => console.error(error));
    });

    app.put('/comment', (req, res) => {
      if (!req.body.id || !req.body.path || !req.body.name || !req.body.email || !req.body.title || !req.body.body) res.status(406).send('Missing data');

      const params = {
        path: req.body.path,
        name: req.body.name,
        email: req.body.email,
        title: req.body.title,
        quote: req.body.quote
      }

      params.filter(p => p);

      commentCollection.findOneAndUpdate(
        {
          _id: ObjectId(req.body.id)
        },
        {
          $set: params
        },
        {}
      )
        .then(result => res.status(200).send('Success'))
        .catch(error => console.error(error));
    });


  })
  .catch(err => {
    console.error(err);
  });

app.listen(3000, function() {
  console.log('listening on 3000');
})