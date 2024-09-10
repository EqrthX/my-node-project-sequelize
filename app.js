const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')

const app = express()

app.listen(3000, () => {

    console.log('Start server on port 3000');

})