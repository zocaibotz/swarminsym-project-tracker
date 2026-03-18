const express = require('express');
const projectsRouter = require('./projects.routes');

const app = express();
app.use(express.json());

app.use('/api', projectsRouter);

module.exports = { app };
