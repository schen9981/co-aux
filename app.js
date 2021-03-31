import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import session from 'express-session';

import indexRouter from './routes/index.js';
import loginRouter from './routes/login.js';
import apiRouter from './routes/api.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('trust proxy', 1);
app.use(session({
  secret: 'coaux secret',
  resave: false,
  saveUninitialized: true}));

// Set static resources directory to be the react build folder.
app.use(express.static('client/build'));
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/api', apiRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error');
});


export default app;
