const express = require('express');
const app = express();
app.use(express.json());

app.use('/admin', express.static(__dirname + '/website'));

module.exports = app;