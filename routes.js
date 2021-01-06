const api = require('./api');

// [ 'method', 'url', function' ]
const routes = [
  [ 'post', '/auth', api.auth, false ],
  [ 'get', '/comments', api.getAllComments, true ],
  [ 'get', '/comments/:path(*)', api.getCommentByPath, false ],
  [ 'post', '/comment', api.postNewComment, false ],
  [ 'put', '/publish', api.publishComment, true ],
  [ 'put', '/unpublish', api.unpublishComment, true ],
  [ 'put', '/comment', api.updateComment, true ],
  [ 'delete', '/comment', api.deleteComment, true ],
]

module.exports = routes.map(route => { 
  return { 
    method: route[0], 
    url: route[1], 
    handler: route[2],
    protected: route[3]
  } 
});