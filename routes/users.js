const express = require('express');
const router = express.Router();
const pgp = require('pg-promise')();
const db = require('../db/connection');
const session = require('express-session');


router.post('/delete-article', (req, res) => {

    let articleId = req.body.articleId;
    db.none('delete from articles where "articleId"= $1', [articleId])
        .then(() => {
            res.redirect('/users/articles');
        });
})

router.post('/update-article', (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let articleId = req.body.articleId;

    db.none('update articles set title = $1, body = $2 where "articleId"= $3', [title, description, articleId])
        .then(() => {
            res.redirect('/users/articles');
        });
});

router.get('/articles/edit/:id', (req, res) => {
    let articleId = req.params.id;
    
    db.one('select "articleId", title, body from articles where "articleId" =  $1', [articleId])
        .then((article) => {
            res.render('edit-article', article);
        });
    
});

router.get('/articles', (req, res) => {
    let userId = req.session.user.userId;
    db.any('select "articleId", title, body from articles where "userId" = $1', [userId])
        .then((articles) => {
            res.render('articles', {articles: articles});
        })
    
});

router.get('/add-article', (req, res) => {
    res.render('add-article');
});

router.post('/add-article', (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let userId = req.session.user.userId;
    db.none('insert into articles (title, body, "userId") values ($1, $2, $3)', [title, description, userId])
    .then(()=> {
        res.render('add-article', {information: 'Article added with Sucess!'});
    });
})


module.exports = router;