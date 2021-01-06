const api = require('./api');

// [ 'method', 'url', function' ]
const routes = [
  [ 'get', '/comments', api.getAllComments ],
  [ 'get', '/mod', api.getUnpublishedComments ],
  [ 'get', '/comments/:path(*)', api.getCommentByPath ],
  [ 'post', '/comment', api.postNewComment ],
  [ 'put', '/publish', api.publishComment ],
  [ 'put', '/unpublish', api.unpublishComment ],
  [ 'put', '/comment', api.updateComment ],
]

module.exports = routes.map(route => { 
  return { 
    method: route[0], 
    url: route[1], 
    handler: route[2] 
  } 
});