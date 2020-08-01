const Movie = require('../models/movie');
const Director = require('../models/director');

exports.getMovies = (req, res, next) => {
	Movie.fetchAll()
		.then((movies) => {
			console.log(movies);
			res.render('movie/movies', {
				pageTitle: 'All movies',
				movies: movies,
				isLoggedIn: req.session.isLoggedIn,
				userList: null,
				path: '/movies'
			});
			console.log('Movies fetched from mongodb!');
		})
		.catch((err) => console.log(err));
};

exports.getAddMovies = (req, res, next) => {
	Director.fetchAll().then((directors) => {
		res.render('movie/add-movie', {
			pageTitle: 'Add movies',
			directors: directors,
			isLoggedIn: req.session.isLoggedIn,
			errorMessage: null,
			path: '/movies/add'
		});
	});
};

exports.postAddMovies = (req, res, next) => {
	const movieTitle = req.body.title;
	const directorId = req.body.directorId;
	const movieYear = req.body.year;
	if(!req.files['movieImg']){
		return Director.fetchAll().then((directors) => {
			return res.render('movie/add-movie', {
				pageTitle: 'Add movies',
				directors: directors,
				isLoggedIn: req.session.isLoggedIn,
				errorMessage: 'Invalid file type!',
				path: '/movies/add'
			});
		});
	}
	const movieImg = req.files['movieImg'][0];
	const movieUrl = '/'+ movieImg.path;

	Director.findById(directorId).then((director) => {
		console.log(director);
		const movieCreated = new Movie(movieTitle, movieYear, director.name, directorId, movieUrl);
		movieCreated
			.save()
			.then((movieDb) => {
				const d = new Director(director.name, director.birthYear, director.movies,director.image);
				d.addMovie(movieCreated, director._id).then(() => {
					res.redirect('/');
				});
			})
			.catch((err) => console.log(err));
	});
};

exports.getMovie = (req, res, next) => {
	const movieId = req.params.movieId;
	Movie.findById(movieId)
		.then((movie) => {
			res.render('movie/movie-details', {
				pageTitle: movie.title,
				movie: movie,
				isLoggedIn: req.session.isLoggedIn,
				path: ''
			});
		})
		.catch((err) => console.log(err));
};

exports.postAddWatched = (req, res, next) => {
	const user = req.user;
	const movieId = req.body.movieId;
	user
		.saveToWatchList(movieId, req.session.user._id)
		.then(() => {
			res.redirect(`/movies/movie-details/${movieId}`);
		})
		.catch((err) => {
			console.log(err);
		});
};
exports.postDeleteWatched = (req, res, next) => {
	const movieId = req.body.movieId;
	req.user
		.deleteWatched(movieId, req.session.user._id)
		.then(() => {
			console.log('movie deleted');
		})
		.catch((err) => {
			console.log(err);
		});

	res.redirect('/watched-movies');
};

exports.postAddWish = (req, res, next) => {
	const user = req.user;
	const movieId = req.body.movieId;
	user
		.saveToWishList(movieId, req.session.user._id)
		.then(() => {
			res.redirect(`/movies/movie-details/${req.body.movieId}`);
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postDeleteWish = (req, res, next) => {
	const movieId = req.body.movieId;
	req.user
		.deleteWish(movieId, req.session.user._id)
		.then(() => {
			console.log('movie deleted');
		})
		.catch((err) => {
			console.log(err);
		});

	res.redirect('/wish-list');
};
