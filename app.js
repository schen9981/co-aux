import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';
import session from 'express-session';
import {Server} from 'socket.io';

import indexRouter from './routes/index.js';
import loginRouter from './routes/login.js';
import apiRouter from './routes/api.js';

import votelistConnectionHandler from './routes/api/playlist/votelist.js';

const app = express();
const sessionManager = session({
  secret: 'coaux secret',
  resave: false,
  saveUninitialized: true,
});

// A middleware to check that the user has logged in.
const checkUser = (req, res, next) => {
  if (req.session.userID) {
    next();
  } else {
    next(new Error('unauthorized'));
  }
};

// A wrapper that converts express middleware to socket.io middleware
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set('trust proxy', 1);
app.use(sessionManager);

// Set static resources directory to be the react build folder.
app.use(express.static('client/build'));
app.use('/', indexRouter);
app.use('/login', loginRouter);

app.use(checkUser);
app.use('/api', apiRouter);

// Bind a socket io to the app
app.set('socketio', new Server({}));

// Register middlewares for socketio
app.get('socketio').of('/api/playlist/votelist').
    use(wrap(sessionManager));
app.get('socketio').of('/api/playlist/votelist').
    use(wrap(checkUser));

// Register socketio connection handler
app.get('socketio').of('/api/playlist/votelist')
    .on('connection', votelistConnectionHandler);

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
