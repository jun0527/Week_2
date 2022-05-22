const http = require('http');
const headers = require('./handle/headers.js');
const errHandle = require('./handle/errHandle.js');
const mongoose = require('mongoose');
const Post = require('./models/posts.js');
const dotenv = require('dotenv');
dotenv.config({path: "./config.env"});

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)
mongoose.connect(DB)
  .then(() => {
    console.log('連接成功');
  })
  .catch((err) => {
    console.log(err);
  })

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chuck) => {
    body += chuck;
  })
  if (req.url === '/post' && req.method === 'GET') {
    const data = await Post.find();
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': data,
    }));
    res.end();
  } else if (req.url === '/post' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const newPost = await Post.create(data);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
          'status': 'success',
          'data': newPost,
        }));
        res.end();
      } catch(err) {
        console.log(err);
        errHandle(res, 400);
      }
    })
  } else if (req.url === '/post' && req.method === 'DELETE') {
    const newPost = await Post.deleteMany({});
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': await Post.find(),
    }));
    res.end();
  } else if (req.url.startsWith( '/post/' ) && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const newPost = await Post.findByIdAndDelete(id);
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': await Post.find(),
    }));
    res.end();
  } else if (req.url.startsWith( '/post/' ) && req.method === 'PATCH') {
    req.on('end', async () => {
      try {
        const id = req.url.split('/').pop();
        const data = JSON.parse(body);
        const newPost = await Post.findByIdAndUpdate(id, data);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
          'status': 'success',
          'data': await Post.find(),
        }));
        res.end();
      } catch(err) {
        console.log(err);
        errHandle(res, 400);
      }
    })
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    errHandle(res, 404);
  }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);