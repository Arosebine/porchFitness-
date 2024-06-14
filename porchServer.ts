require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
// import dotenv from 'dotenv';
const { connectDB } = require("./src/config/porchdatabase");
import './src/cron/cron';

connectDB();

const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(helmet());


app.get('/', (req, res) => {
  res.send('Fitness+ Membership Management System');
});


app.listen(port, () => {
  console.log(`Porch Plus Server started on port: http://localhost:${port}`);
});
