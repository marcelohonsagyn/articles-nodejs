const express = require('express');
const app = express();
const mustacheExpress = require('mustache-express');
const bodyParser  =require( 'body-parser');
const path = require('path');
const userRouter = require('./routes/users');
const indexRouter = require('./routes/index');
const session = require('express-session');
const { checkAuthorization } = require('./middleware/checkauthorization')

//Constants
const VIEWS_PATH = path.join(__dirname, '/views');
const PORT = 80;

app.use(session({
    secret: 'asdfadfadf',
    resave: false,
    saveUninitialized: false,
}));

//register and configure view egine
app.engine('mustache', mustacheExpress(VIEWS_PATH + '/partials', '.mustache'));
app.set('views', './views', VIEWS_PATH);
app.set('view engine', 'mustache');
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    res.locals.authenticated = req.session.user == null ? false : true;
    next();
})
//routes
app.use('/', indexRouter);
app.use('/users', checkAuthorization, userRouter);

app.listen(PORT, () => {
    console.log(`Server is listening port ${PORT}`);
});