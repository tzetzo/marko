const express = require('express'); //import express 3rd party library;
const path = require('path'); //import build-in module; converts paths
const port = process.env.PORT || 8080; //declare the port; process.env.PORT is provided by heroku
const app = express(); //create express application

app.use(express.static(__dirname));

app.get('*', (req, res) => { //sends the user index.html by default;
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
