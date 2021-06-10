const port = process.env.PORT || 3000;
const app = require('./src/app');

// Start listening for requests.
app.listen(port, function(){
  console.log(`Lincense Server is running on port ${port}.`);
});

process.on('uncaughtException', err => console.error('uncaught exception:', err.toString(), err));
process.on('unhandledRejection', error => console.error('unhandled rejection:', error.toString(), error));
