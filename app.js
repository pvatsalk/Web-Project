var express = require('express');
var mongoose = require('mongoose');
var app = express();
var database = require('./config/database1');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
var path = require('path'); // importing path

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
const exphbs = require('express-handlebars'); 
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(path.join(__dirname, 'public')));  // enabling the static assets

// app.engine('.hbs', exphbs.engine({ extname: '.hbs' })); // template engine


app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
   
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },
  
  defaultLayout: 'main'
}));

mongoose.connect(database.url);

// var Book = require('./models/books');
app.set('view engine', 'hbs');

app.get('/', function(req, res) { // root route
  res.render('index', { title: 'Project' });
});


app.listen(port);
console.log("App listening on port : " + port);
