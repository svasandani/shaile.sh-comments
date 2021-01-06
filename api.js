module.exports = {
  db: null,

  commentCollection: null,

  ObjectId: null,

  init: (client, ObjectId) => {
    this.db = client.db('comments');
    this.commentCollection = this.db.collection('comments');
    this.ObjectId = ObjectId;
  },

  getAllComments: (req, res) => {
    const cursor = this.commentCollection.find();
    cursor.toArray()
      .then(data => res.send(data));
  },

  getUnpublishedComments: (req, res) => {      
    const cursor = this.commentCollection.find(
      {
        published: false
      }
    );
    cursor.toArray()
      .then(data => res.send(data));
  },

  getCommentByPath: (req, res) => {
    if (!req.params.path) {
      res.status(406);
      res.send('Please specify a path');
    }
    
    const cursor = this.commentCollection.find(
      {
        path: req.params.path,
        published: true
      }
    );
    cursor.toArray()
      .then(data => res.send(data));
  },

  /*
  {
    "path": path of post to show comment,
    "name": name of commenter,
    "email": email of commenter,
    "title": title of comment,
    "body": body of comment
  }
  */
  postNewComment: (req, res) => {
    if (!req.body.path || !req.body.name || !req.body.email || !req.body.title || !req.body.body) res.status(406).send('Missing data');

    const data = req.body;
    data.published = false;

    this.commentCollection.insertOne(req.body)
      .then(result => {
      })
      .catch(error => console.error(error));
    
    res.status(200).send('Success');
  },

  /*
  {
    "id": id of comment to publish
  }
  */
  publishComment: (req, res) => {
    if (!req.body.id) res.status(406).send('Missing data');

    this.commentCollection.findOneAndUpdate(
      {
        _id: this.ObjectId(req.body.id)
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
  },

  /*
  {
    "id": id of comment to publish
  }
  */
  unpublishComment: (req, res) => {
    if (!req.body.id) res.status(406).send('Missing data');

    this.commentCollection.findOneAndUpdate(
      {
        _id: this.ObjectId(req.body.id)
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
  },

  /*
  {
    "id": id of comment
    "path": path of post to show comment, OPTIONAL,
    "name": name of commenter, OPTIONAL,
    "email": email of commenter, OPTIONAL,
    "title": title of comment, OPTIONAL,
    "body": body of comment, OPTIONAL
  }
  */
  updateComment: (req, res) => {
    // if (!req.body.id || !req.body.path || !req.body.name || !req.body.email || !req.body.title || !req.body.body) {
    //   res.status(406).send('Missing data');
    //   return;
    // }
    
    if (!req.body.id) {
      res.status(406).send('Missing data');
      return;
    }

    const oldParams = {
      path: req.body.path,
      name: req.body.name,
      email: req.body.email,
      title: req.body.title,
      body: req.body.body
    }

    const params = {};

    Object.keys(oldParams).forEach(key => {
      if (oldParams[key]) params[key] = oldParams[key];
    })

    this.commentCollection.findOneAndUpdate(
      {
        _id: this.ObjectId(req.body.id)
      },
      {
        $set: params
      },
      {}
    )
      .then(result => res.send('Success'))
      .catch(error => console.error(error));
  }
}