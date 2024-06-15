require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const connectDB = require('./src/connection/porchdatabase');
const membershipController = require('./src/cron/cronjob.cron');
const memberRoutes = require('./src/routes/member.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
connectDB();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.get('/', (req, res) => {
    res.send('Hello Porch Plus Fitness');
});


cron.schedule('* * * * *', async () => {
    await membershipController.checkMembershipFees();
  });

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/members', memberRoutes);

app.listen(port, () => {
    console.log(`PorchPlus Server is running on port http://localhost:${port}`);
});

