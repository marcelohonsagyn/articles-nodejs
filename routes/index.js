const express = require('express');
const router = express.Router();
const pgp = require('pg-promise')();
const db = require('../db/connection');
const session = require('express-session');
const bcrypt = require('bcrypt');
const SALT_ROUND = 10;

router.get('/logout', (req, res, next) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                next(error);
            } else {
                res.redirect('/login');
            }
        })
    }
});

router.get('/', (req, res) => {
    db.any('select "articleId", title, body, "dateCreated" from articles order by "dateCreated" DESC')
        .then((articles) => {
            res.render('index', {articles: articles});
        })
    
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    db.oneOrNone('select "userId" from users where username = $1', [username]).then((user) => {
        if (user) {
            res.render('register', { message: `There is a user registred with email ${username}`});
        } else {
            bcrypt.hash(password, SALT_ROUND, function (error, hash) {
                if (error == null) {
                    db.none('insert into users (username, password) values ($1, $2)', [username, hash])
                        .then(() => {
                            res.send('SUCCESS');
                        });
                }
            })

        }
    })
});

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', (req, res) => {

    //let username = req.body.username;
    //let password = req.body.password;

    let username = "Marcelo Honório dos Santos";
    let password = "123456";

    db.oneOrNone('select "userId", username, password from users where username = $1', [username]).
        then((user) => {
            if (user) {
                bcrypt.compare(password, user.password, function(error, result) {
                    if (result) {
                        if (req.session) {
                            req.session.user = {userId: user.userId, username: user.username};
                        }
                        res.redirect('/users/add-article');
                    } else {
                        res.render('login', {message: "Wrong Password"});
                    }
                });
            } else {
                res.render('login', {message: "Invalid username or password"});
            }
        }) 
});


module.exports = router;
