const App = require('./app')
const mongoose = require('mongoose')

const PORT = process.env.PORT || 4000;

const CON_STR = 'mongodb://127.0.0.1:27017/tumblr-app'
mongoose.connect(CON_STR, { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.connection.on('open', () => console.log('server is connected'))
mongoose.connection.on('error', (error) => console.log(error))

App.listen(PORT, () => console.log("server is running"))