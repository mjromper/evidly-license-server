'use strict'
/* dependencies */
const express = require('express');
const apiRouter = require('./api').router;

// Create an Express application.
const app = express();

// Add body parser.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Add routers
app.use('/v1', apiRouter);
app.get('/', (req, res) => res.redirect('/status'))
app.get('/status', (req, res)=> res.json({status: 0}))

app.use((req, res, next) => res.send("Not found: 404"))

app.use((err, req, res, next) => {
  console.error(err)
  if (res.headerSent) return next(err)
  return res.send("500")
});

module.exports = app;

