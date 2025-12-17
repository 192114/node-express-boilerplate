import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes/index';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(errorMiddleware)

export default app;