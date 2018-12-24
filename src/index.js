import http from 'http';
import express from 'express';
import localIP from 'my-local-ip';
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';

const { argv } = yargs
  .alias('p', 'port')
  .alias('b', 'basePath');

const port = argv.port || 3000;
const basePath = argv.basePath || '';
const app = express();
const server = http.createServer({}, app);
const localHostname = localIP();

const compressions = [{
  encoding: 'br',
  extension: 'br',
}, {
  encoding: 'gzip',
  extension: 'gz',
}];

const types = [{
  extension: '.js',
  contentType: 'text/javascript',
}, {
  extension: '.css',
  contentType: 'text/css',
}, {
  extension: '.html',
  contentType: 'text/html',
}];

const staticPath = path.resolve((basePath || __dirname), (argv._[0] || '.'));

const serveCompressed = (contentType) => (req, res, next) => {
  const acceptedEncodings = req.acceptsEncodings();

  const urlParts = req.originalUrl.split('/');
  const fileName = urlParts.pop();
  const filePath = urlParts.join('/');

  const compression = compressions.find(comp => (
    acceptedEncodings.indexOf(comp.encoding) !== -1 &&
    fs.existsSync(`${staticPath}${filePath ? `/${filePath}` : ''}/${fileName}.${comp.extension}`)
  ));

  if (compression) {
    req.url = `${req.url}.${compression.extension}`;
    res.set('Content-Encoding', compression.encoding);
    res.set('Content-Type', contentType);
  }

  next();
};

types.forEach(({
  extension,
  contentType,
}) => app.get(`*${extension}`, serveCompressed(contentType)));

app.use('/', express.static(staticPath));

server.listen(port, () => console.log((
  '\n' +
  `serving folder: ${staticPath}` +
  '\n' +
  `at http://${localHostname}:${port}\n`
)));
