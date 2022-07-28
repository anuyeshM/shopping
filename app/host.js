const express = require('express');
const https = require('https');
const fs = require('fs');
const path    = require('path');

const app=express();
app.use(express.static(path.join(__dirname, 'build')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const options = {
 key: fs.readFileSync('C:/GIT/SSL/server.key'),
   //key: fs.readFileSync('./ssl/key.pem'),
   //cert: fs.readFileSync('./ssl/cert.pem'),
  cert: fs.readFileSync('C:/GIT/SSL/854799b8cc8e17d7.crt'),
  ca: [fs.readFileSync('C:/GIT/SSL/gd_bundle-g2-g1.crt')],
};
https.createServer(options, app ).listen(443);
