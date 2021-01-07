const nodemailer = require("nodemailer");
const templates = require('./templates');

module.exports = {
  db: null,

  commentCollection: null,

  ObjectId: null,

  transporter: null,

  init: (client, ObjectId) => {
    this.db = client.db('comments');
    this.commentCollection = this.db.collection('comments');
    this.ObjectId = ObjectId;

    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  },

  /*
  {
    "key": unique key
  }
  */
  auth: (req, res) => {
    if (!req.body.key) {
      res.status(406).send('No key provided');
      return;
    }

    if (req.body.key === process.env.SUPER_SECRET_USER_KEY) {
      res.status(200).send({
        "api_key": process.env.SUPER_SECRET_API_KEY
      });
      return;
    }

    res.status(403).send('Incorrect key');
  },

  testEmail: (req, res) => {
    
  },

  getAllComments: (req, res) => {
    const cursor = this.commentCollection.find();
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
        path: encodeURIComponent(req.params.path),
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
    "body": body of comment,
    "replyTo": parent comment,
    "date": date of comment (ISO string)
  }
  */
  postNewComment: (req, res) => {
    if (!req.body.path || !req.body.name || !req.body.email || !req.body.title || !req.body.body || !req.body.date) {
      res.status(406).send('Missing data');
      return;
    }

    const data = req.body;
    data.published = false;
    if (!req.body.replyTo) req.body.replyTo = "";

    this.commentCollection.insertOne(req.body)
      .then(result => {})
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
      .then(result => {

        const newCursor = this.commentCollection.find(
          {
            _id: this.ObjectId(req.body.id)
          }
        );

        newCursor.toArray()
            .then(data => {
              let newComment = data[0];

              if (newComment.replyTo) {
                const repliedCursor = this.commentCollection.find(
                  {
                    _id: this.ObjectId(newComment.replyTo)
                  }
                );
      
                repliedCursor.toArray()
                  .then(repliedData => {
                    let repliedComment = repliedData[0];
      
                    this.transporter.sendMail({
                      from: '"Shailesh Codes" <blog@shaile.sh>',
                      to: repliedComment.email,
                      subject: "Someone replied to your comment!",
                      text: templates.newCommentText(repliedComment, newComment),
                      html: templates.newCommentHTML(repliedComment, newComment)
                    })
                      .then(info => console.log(`Mail sent! Id: ${info.messageId}`))
                      .catch(error => {
                        console.error(error)
                      });
                  })
              }

              res.status(200).send('Success') 
            })
      })
      .catch(error => console.error(error));
  },

  /*
  {
    "id": id of comment to publish
  }
  */
  unpublishComment: (req, res) => {
    if (!req.body.id) {
      res.status(406).send('Missing data');
      return;
    }

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
  },

  deleteComment: (req, res) => {
    if (!req.body.id) {
      res.status(406).send('Missing data');
      return;
    }

    this.commentCollection.deleteOne(
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
  }
}