import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { debug } from 'console';
import path from 'path';
import mongoose from 'mongoose';
import cors from 'cors';
import { AuthController } from './controller/authController';
import { router } from './routes';

const app: Application = express();

mongoose.connect('mongodb://localhost:27017/sixteenshopsdb');

mongoose.set('debug', true);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Middleware to create a variable with the token info
// if there is a token in the Authorization header of the request
app.use(AuthController.parseToken);

// If the user is logged then update his last connection to the API
app.use(AuthController.logConnection);

// Main router of the application
app.use(router);

// Error middleware to catch errors and return a message in json
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(400).send({ error: err.message });
});

// Public files of the application. Comes last so it doesn't overwrite the main router
app.use(express.static(__dirname + "/../storage/public"));

// Port of the application
const port = 3000;

// Open node server
const server = app.listen(port, () => console.log('Server running'));

server.on('error', onError);
server.on('listening', onListening);

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
  
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr!.port;
  debug('Listening on ' + bind);
}