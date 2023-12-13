var express = require('express');
var mongoose = require('mongoose');
var app = express();
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
var path = require('path'); // importing path
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const clientSessions = require("client-sessions");


var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
const exphbs = require('express-handlebars');
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(path.join(__dirname, 'public')));  // enabling the static assets
app.use(express.static('public'))


app.use(cookieParser());

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "secret", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));
// app.engine('.hbs', exphbs.engine({ extname: '.hbs' })); // template engine
const ITEMS_PER_PAGE = 10;


const user = {
  username: "vatsal",
  password: "vatsal",
  email: "vatsal@gmail.com"
};

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
    // res.redirect("/api/Movies");
  }
}

app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {

    json: function (context) {
      return JSON.stringify(context);
    }
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  },

  defaultLayout: 'main'
}));

mongoose.connect(database.url);

var Movie = require('./models/movie');
app.set('view engine', 'hbs');

app.get('/', ensureLogin, async function (req, res) { // root route
  // const movies = await Movie.find().exec();

  // res.render('index', { title: 'Project' });
  res.redirect("/login");

  // console.log(movies);
});
app.get("/login", (req, res) => {
  res.render("login", {
    errorMsg: ""
  });
});



//Login Page Drashti
app.post('/login', (req, res) => {
  // res.render('login');
  const username = req.body.username;
  const password = req.body.password;

  console.log(username);
  console.log(password);

  if (username === "" || password === "") {
    res.render("login", {
      errorMsg: "Missing credentials."
    });
  } else {
    if (username == user.username && password == user.password) {
      req.session.user = {
        username: user.username,
        email: user.email
      };
      res.redirect("/api/Movies");
    } else {
      res.render("login", {
        errorMsg: "invalid username or password!"
      });
    }
  }

});

app.get('/api/Movies', ensureLogin, async function (req, res) {

  // root route
  Movie.find().limit(10).exec()
    .then(movies => {
      res.render('all_movies', { movies: movies });
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
});
//Star ratings
app.get('/api/Movies1', ensureLogin, async function (req, res) {
  try {
    // Retrieve movies from the database
    const movies = await Movie.find();

    // Group movies by genres
    const groupedMovies = groupAndLimitByGenres(movies, 7);

    res.render('all_movies1', { groupedMovies });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/api/Movies/:movie_id', function (req, res) {
  let id = req.params.movie_id;
  Movie.findById(id)
    .then(movie => {
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.render('movie_data', { data: movie });
    })
    .catch(error => {
      res.status(500).send(error.message);
    });


});

app.get('/searchMovies', (req, res) => {
  // Retrieve parameters from the query string
  const page = req.query.page || 1;
  const perPage = req.query.perPage || 5;
  const title = req.query.title || '';

  // You can use these parameters to query your movie data
  // For simplicity, let's assume you have a Movie model and you want to find movies by title
  Movie.find({ title: { $regex: title, $options: 'i' } })
    .skip((page - 1) * perPage)
    .limit(parseInt(perPage))
    .exec()
    .then(movies => {
      res.render('search_movies', { movies, currentPage: parseInt(page), perPage, title });
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
});



app.post('/api/movie_search', urlencodedParser, function (req, res) {
  const id = req.body.search;
  console.log(id);

  Movie.findOne({ title: id })
    .then(movie => {
      res.render('movie_data', { data: movie });
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
});

app.get('/api/movie_add', async function (req, res) { // root route
  // const movies = await Movie.find().exec();

  res.render('add_movie', {});
  // console.log(movies);
});




// create employee and send back all employees after creation
app.post('/api/add_movie', async function (req, res) {
  // create mongose method to create a new record into collection
  console.log(req.body);
  // console.log(Book);
  try {
    const movie = await Movie.create({
      title: req.body.title,
      plot: req.body.plot,
      genres: req.body.genres,
      runtime: req.body.runtime,
      rated: req.body.rated,
      cast: req.body.cast,
      fullplot: req.body.fullplot,
      languages: req.body.languages,
      released: req.body.released,
      directors: req.body.directors,
      writers: req.body.writers,
      awards: req.body.awards,
      year: req.body.year,
      imdb: req.body.imdb,
      countries: req.body.countries,
      type: req.body.type,
      tomatoes: req.body.tomatoes,
      dvd: req.body.dvd
    });
    // res.json("Record Added Successfully");
    res.render('index', { data: "Record Added Successfully" });

  } catch (error) {
    res.status(500).send(error.message);

  }
});











app.post('/api/movie_update/:id', function (req, res) {
  // let id = req.params.book_id; // if using parameters in the route
  let id = req.body.id;

  let id1 = req.params.id;
  console.log(id);


  res.render('update_movie', { id: id1 });

});







app.post('/api/movie_delete/:id', function (req, res) {
  // let id = req.params.book_id; // if using parameters in the route
  let id = req.body.id;

  let id1 = req.params.id;
  console.log(id);

  Movie.deleteOne({ _id: id1 })
    .then(result => {

      res.render('index', { title: 'Project' });
    })
    .catch(error => {
      res.send(error);
      console.log(error);
    });
});

function groupAndLimitByGenres(movies, limitPerGenre) {
  const groupedMovies = {};

  // Group and limit movies by genres
  movies.forEach(movie => {
    movie.genres.forEach(genre => {
      if (!groupedMovies[genre]) {
        groupedMovies[genre] = [];
      }

      // Limit the number of records per genre
      if (groupedMovies[genre].length < limitPerGenre) {
        groupedMovies[genre].push(movie);
      }
    });
  });

  // Convert object to array for rendering
  const result = [];
  for (const genre in groupedMovies) {
    result.push({ name: genre, movies: groupedMovies[genre] });
  }

  return result;
}

function groupByGenres(movies) {
  const groupedMovies = {};

  // Group movies by genres
  movies.forEach(movie => {
    movie.genres.forEach(genre => {
      if (!groupedMovies[genre]) {
        groupedMovies[genre] = [];
      }
      groupedMovies[genre].push(movie);
    });
  });

  // Convert object to array for rendering
  const result = [];
  for (const genre in groupedMovies) {
    result.push({ name: genre, movies: groupedMovies[genre] });
  }

  return result;
}

app.listen(port);
console.log("App listening on port : " + port);
