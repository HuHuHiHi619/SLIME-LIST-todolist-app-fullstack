const compression = require('compression')
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { readdirSync } = require('fs')
const connectDb = require('./Config/db')
const app = express();
const path = require('path')
const { checkOverdueTasks, updateOverdueTasks, resetDailyStreakStatus } = require('./job/cronJob');

const imagesPath = path.join(__dirname, '../images/badges');

connectDb();
app.use(morgan('dev'));
app.use(compression({
  threshold: 0, 
}));

app.use(cors({
  origin:'http://localhost:5173',
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  credentials: true,
 
}));
app.use(cookieParser());
app.use(express.json());

app.use('/uploads', compression(), express.static(path.join(__dirname, 'uploads')));
app.use('/images', compression(), express.static(imagesPath));


require('dotenv').config();

checkOverdueTasks();



readdirSync('./Routes').map((route) => 
  app.use('/api',require('./Routes/' + route)))

app.listen(5000,()=> console.log('Server in Running'))