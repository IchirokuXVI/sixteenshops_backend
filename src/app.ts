import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { debug } from 'console';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { rolesRouter } from './routes/roles';
import { permissionsRouter } from './routes/permissions';
import { productRouter } from './routes/product';
import path from 'path';
import mongoose from 'mongoose';

const app: Application = express();

mongoose.connect('mongodb://localhost:27017/sixteenshopsdb');

mongoose.set('debug', true);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/roles', rolesRouter);
app.use('/permissions', permissionsRouter);
app.use('/products', productRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(400).send({ error: err.message });
});

const port = 3000;

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