const express = require('express');
const app = express();
const cors = require('cors')
app.use(express.json());
app.use(cors());

app.use('/admin', express.static(__dirname + '/website'));

module.exports = app;