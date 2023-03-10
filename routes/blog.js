const express = require('express');
const mongodb = require('mongodb');

const db = require('../data/database');

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts',async function(req, res) {
  const posts = await db.getDb().collection('posts').find({}).project( {title: 1, summary: 1 , 'author.name': 1 }).toArray();
// console.log(posts);
  res.render('posts-list', {posts: posts});
});

router.get('/new-post', async function(req, res) {
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', { authors: authors });
});

router.post('/posts', async function(req, res) {
  console.log(req.body.author);
  const authorId = new ObjectId(req.body.author);
  console.log(authorId);
  const author = await db.getDb().collection('authors').findOne({ _id: authorId });

  const newPost = { 
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
  };

  const result = await db.getDb().collection('posts').insertOne(newPost);
  console.log(result);
  res.redirect('/posts');
});

router.get('/posts/:id', async function(req, res){
  const postId = req.params.id;
  console.log(postId);
 const post = await db.getDb().collection('posts').findOne({_id: new ObjectId(postId)}, { summary: 0});
console.log(post);

if (!post){
  return res.status(404).render('404');
}

post.humanReadableDate = post.date.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
console.log(post);
post.date = post.date.toISOString();
console.log(post.date);

res.render('post-detail', { post: post})
});

router.get('/posts/:id/edit', async function(req, res){
  console.log(req.params);
  const postId = req.params.id;
  const post = await db.getDb().collection('posts').findOne({_id: new ObjectId(postId)}, { title: 1, summary: 1, body:1});
  console.log(post);

  if (!post){
    return res.status(404).render('404');
  }
    res.render('update-post', { post: post});
});

router.post('/posts/:id/edit',async function(req, res){
console.log(req.body);
const postId = new ObjectId( req.params.id);
const result = await db.getDb().collection('posts').updateOne({ _id: postId }, { $set : {
  title: req.body.title ,
  summary: req.body.summary,
  body: req.body.content
}})

  res.redirect('/posts');
});

router.post('/posts/:id/delete',async function(req, res){
  const postId = new ObjectId( req.params.id);
const result = await db.getDb().collection('posts').deleteOne({_id: postId});

res.redirect('/posts');
});

// router.get('/posts/:id/delete',async function(req, res){
//   const postId = new ObjectId( req.params.id);
// const result = await db.getDb().collection('posts').deleteOne({_id: postId});

// res.redirect('/posts');
// });


  module.exports = router;