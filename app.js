// ==============================
// Alex Munoz
// CS_290: Web Development
// Website Project
// ==============================

// Constants
var PORT = 3000;

// Import dependencies
var express = require('express');
var mysql = require('mysql')
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

// Initialize the application
var app = express();

// Set the view engine and server port for the application to use
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', PORT);

// Middleware function to use static files (for css styling)
app.use(express.static("css"));
app.use(express.static("views"));

// Middleware functions to support POST requests
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Request Handling
// GET Home page (Default)
app.get('/',function(req,res){
    res.render('home');
});

// POST request handling




// // Error Handling
// app.use(function(req,res){
//     res.status(404);
//     res.render('404', {layout: 'error.handlebars'});
// });

// app.use(function(err, req, res, next){
//     console.error(err.stack);
//     res.type('plain/text');
//     res.status(500);
//     res.render('500', {layout: 'error.handlebars'});
// });

// Start Server
app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});