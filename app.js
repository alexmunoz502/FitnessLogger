// =============================================
// Alex Munoz
// CS_290: Web Development
// Homework Assignment 6: Database Interactions
// =============================================

// Import dependencies
var express = require('express');
var mysql = require('./dbcon.js')
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

// Initialize the application
var app = express();

// Set the view engine and server port for the application to use
app.set('port', 8734);
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Middleware for handling POSTs
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// SQL Strings
const selectQuery = "SELECT * FROM workouts";
const insertQuery = "INSERT INTO workouts (name, reps, weight, date, lbs) VALUES (?, ?, ?, ?, ?)";
const updateQuery = "UPDATE workouts SET name=? reps=? weight=? date=? lbs=? WHERE id=?";
const deleteQuery = "DELETE FROM workouts WHERE id=?";
const dropTableQuery = "DROP TABLE IF EXISTS workouts";
const createTableQuery = 
    `CREATE TABLE workouts(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    reps INT,
    weight INT,
    date DATE,
    lbs BOOLEAN);
    `;

// Request Handling
// Reset Table for Testing Purposes
app.get('/reset-table',function(req,res,next){
    var context = {};
    mysql.pool.query(dropTableQuery, function(err){
      mysql.pool.query(createTableQuery, function(err){
        context.results = "Table reset";
        res.render('home',context);
      })
    });
  });

// Select
app.get('/',function(req,res,next){
    /*
    This route is for the initial visit to the website or refreshing.
    All application data manipulation is routed through Put/Post and Delete routing
    To be manipulated by the script.js DOM interaction
    */
    // Select All Query
    var context = {};
    mysql.pool.query(selectQuery, function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        // Store MySQL Query results in context variable to pass to webpage
        context.results = rows;

        // Convert the dates in the query results to be in mm/dd/yyyy format
        for(entry in rows) {
            var entryDate = new Date(rows[entry].date);
            rows[entry].date = entryDate.toLocaleDateString('en-US', {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
        };

        // Render the home page with the MySQL data context
        res.render('home', context);
    });
});

// Insert
app.post('/',function(req,res,next){

    // Insert Query
    var {name, reps, weight, date, lbs} = req.body;
    mysql.pool.query(insertQuery, [name, reps, weight, date, lbs], function(err, result){
        if(err){
            next(err);
            return;
        }
    });
    // Select All Query
    var context = {};
    mysql.pool.query(selectQuery, function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        // Store MySQL Query results in context variable to pass to webpage
        context.results = rows;

        // Convert the dates in the query results to be in mm/dd/yyyy format
        for(entry in rows) {
            var entryDate = new Date(rows[entry].date);
            rows[entry].date = entryDate.toLocaleDateString('en-US', {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                });
        };

        // Render the home page with the MySQL data context
        res.send(rows);
    });
});

// Update
app.put('/update',function(req,res,next){
    var context = {};
    var {name, reps, weight, date, lbs} = req.body;
    mysql.pool.query(updateQuery, [name, reps, weight, date, lbs], function(err, result){
        if(err){
            next(err);
            return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('home',context);
    });
  });

// Delete
app.delete('/',function(req,res,next){
    // Delete Query
    mysql.pool.query(deleteQuery, [req.body.id], function(err, result){
        if(err){
            next(err);
            return;
        }
    });
    // Select All Query
    var context = {};
    mysql.pool.query(selectQuery, function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        // Store MySQL Query results in context variable to pass to webpage
        context.results = rows;

        // Convert the dates in the query results to be in mm/dd/yyyy format
        for(entry in rows) {
            var entryDate = new Date(rows[entry].date);
            rows[entry].date = entryDate.toLocaleDateString('en-US', {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
        };

        // Render the home page with the MySQL data context
        res.send(rows);
    });
});

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