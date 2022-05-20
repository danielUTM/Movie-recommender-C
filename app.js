"use strict";
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const {v4: uuidv4} = require('uuid');

var userid = uuidv4();

const sqlite3 = require('sqlite3');
const { response } = require('express');

var collaborativeFilteringTable = [
    [1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
];

//1st Row is female
//2nd Row is male
//columns are age grops, <18, 18-29, 30-44, 45+
// var genderAgeTable = [
//     [ [1,2,3,4], [0,1,4], [0,1,4], [0,1,3,4] ],
//     [ [0], [2,3], [2,3], [2] ]
// ]

var username = "";
var age = "";
var gender = "";
var highestRatedIndex = 0;
var lastCluster = 0;
var row = 0;
var column = 0;
var numberOfRecommendations = 0;

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

//Loading in the Database
let db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database');
});

//Querying the Database
// db.serialize(() => {
//     db.each(`SELECT id, title FROM all_movies`, (err, row) => {
//         if(err){
//             console.log(err.message);
//         }
//         console.log(row.id + "\t" + row.title);
//     });
// })

//GET Request for all movies
app.get('/getAllMovies', function(req, res) {
    db.all('SELECT * FROM all_movies ORDER BY rank', (error, result) => {
        res.send(result);
    });  
});

//GET Request for cluster 0
app.get('/getCluster0', function(req, res) {
    db.all('SELECT * FROM cluster0_edited ORDER BY rank DESC', (error, result) => {
        res.send(result);
    });  
});

//GET Request for cluster 1
app.get('/getCluster1', function(req, res) {
    db.all('SELECT * FROM cluster1_edited ORDER BY rank DESC', (error, result) => {
        res.send(result);
    });  
});

//GET Request for cluster 2
app.get('/getCluster2', function(req, res) {
    db.all('SELECT * FROM cluster2_edited ORDER BY rank DESC', (error, result) => {
        res.send(result);
    });  
});

//GET Request for cluster 3
app.get('/getCluster3', function(req, res) {
    db.all('SELECT * FROM cluster3_edited ORDER BY rank DESC', (error, result) => {
        res.send(result);
    });  
});

//GET Request for cluster 4
app.get('/getCluster4', function(req, res) {
    db.all('SELECT * FROM cluster4_edited ORDER BY rank DESC', (error, result) => {
        res.send(result);
    });  
});

app.get('/getRecommendations', function(req, res){
    username = parseInt(username)
    var group1Ratings = [];
    var group2Ratings = []
    var group3Ratings = []
    var group4Ratings = []
    var group5Ratings = []
    var userRatings = [];
    var avgUserRatings = [];
    db.all('SELECT * FROM users WHERE username = $user', {$user: username},(error2, resultUsers) => {
        // age = resultUsers[0].age;
        // gender = resultUsers[0].gender;

        //Gets called for each row
        db.each('SELECT * FROM user_behaviour ORDER BY timestamp DESC', (error, result) => {
            //Regex expressions to match the buttons
            var reg1 = /g1/;
            var reg2 = /g2/;
            var reg3 = /g3/;
            var reg4 = /g4/;
            var reg5 = /g5/;
            //Find the latest button from g1 movies that has been clicked
            if (result.userId === username && reg1.test(result.button)){
                group1Ratings.push(result.button.charAt(5));
            };
            //Find the latest button from g2 movies that has been clicked
            if (result.userId === username && reg2.test(result.button)){
                group2Ratings.push(result.button.charAt(5));
            };
            //Find the latest button from g3 movies that has been clicked
            if (result.userId === username && reg3.test(result.button)){
                group3Ratings.push(result.button.charAt(5));
            };
            //Find the latest button from g4 movies that has been clicked
            if (result.userId === username && reg4.test(result.button)){
                group4Ratings.push(result.button.charAt(5));
            };
            //Find the latest button from g5 movies that has been clicked
            if (result.userId === username && reg5.test(result.button)){
                group5Ratings.push(result.button.charAt(5));
            };
            

        }, (error, numberofRows) => {
            //Creates a list of all the ratings for each group
            userRatings = [group1Ratings, group2Ratings, group3Ratings, group4Ratings, group5Ratings];
            for (var r of userRatings) {
                if (r.length === 0) {
                    avgUserRatings.push(0);
                }
                else {
                    avgUserRatings.push(r.reduce((a, b) => parseInt(a) + parseInt(b)) / r.length);
                }
                
            }
            //Only gets called onced after all the above rows have been checked

            //Getting the row of the collaborative filtering table based on age
            // if(age === "<18"){
            //     row = 0;
            // }else if(age === "18-29"){
            //     row = 1;
            // }else if(age === "30-44"){
            //     row = 2;
            // }else if(age === "45+"){
            //     row = 3;
            // }

            // if(gender === "male"){
            //     row += 4;
            // }
            
            //Find the highest rated group & updating table
            var highestRated = 0;
            for (var i=0; i<5; i++){
                if(numberOfRecommendations == 0){
                    //Updating Collaborative Filtering Table with user ratings
                    collaborativeFilteringTable[row][i] = parseInt(avgUserRatings[i]);
                }
                //Keeping track of highest rated group
                if(collaborativeFilteringTable[row][i] > highestRated){
                    highestRated = collaborativeFilteringTable[row][i];
                    highestRatedIndex = i;
                }
            }
        
            //Send the cluster that is rated highest & updating last cluster sent variable
            if(highestRatedIndex == 0){
                db.all('SELECT * FROM cluster0_edited ORDER BY rank DESC', (error, result) => {
                    res.send(result);
                });
                lastCluster = 0;
            }else if(highestRatedIndex == 1){
                db.all('SELECT * FROM cluster1_edited ORDER BY rank DESC', (error, result) => {
                    res.send(result);
                });
                lastCluster = 1;
            }else if(highestRatedIndex == 2){
                db.all('SELECT * FROM cluster2_edited ORDER BY rank DESC', (error, result) => {
                    res.send(result);
                });
                lastCluster = 2
            }else if(highestRatedIndex == 3){
                db.all('SELECT * FROM cluster3_edited ORDER BY rank DESC', (error, result) => {
                    res.send(result);
                });
                lastCluster = 3
            }else if(highestRatedIndex == 4){
                db.all('SELECT * FROM cluster4_edited ORDER BY rank DESC', (error, result) => {
                    res.send(result);
                });
                lastCluster = 4;
            }
            numberOfRecommendations++;
        })
    })
})

//POST request to get data on what the user rated the recommendations
app.post('/postRecommendationData', function(req, res){
    column = lastCluster;
    //Updating the collaborative filtering table based on if they liked the recommendations or not
    if(req.body.data.charAt(2) == 'N'){
        collaborativeFilteringTable[row][column]--;
    }else if(req.body.data.charAt(2) == 'Y'){
        collaborativeFilteringTable[row][column]++;
    }
})

//GET Request to get movie ratings
app.get('/getRatings', function(req, res){
    //Sends all g1 buttons pressed
    if(highestRatedIndex == 0){
        db.all("SELECT * FROM user_behaviour WHERE button LIKE '%g1%'", (error, result) => {
            res.send(result);
        })
    //Sends all g2 buttons pressed
    }else if(highestRatedIndex == 1){
        db.all("SELECT * FROM user_behaviour WHERE button LIKE '%g2%'", (error, result) => {
            res.send(result);
        })
    //Sends all g3 buttons pressed
    }else if(highestRatedIndex == 2){
        db.all("SELECT * FROM user_behaviour WHERE button LIKE '%g3%'", (error, result) => {
            res.send(result);
        })
    //Sends all g4 buttons pressed
    }else if(highestRatedIndex == 3){
        db.all("SELECT * FROM user_behaviour WHERE button LIKE '%g4%'", (error, result) => {
            res.send(result);
        })
    //Sends all g5 buttons pressed
    }else if(highestRatedIndex == 4){
        db.all("SELECT * FROM user_behaviour WHERE button LIKE '%g5%'", (error, result) => {
            res.send(result);
        })
    }
})

//GET request to get gender and age of user
app.get('/userAgeAndGender', function(req, res){
    db.all('SELECT * FROM users WHERE username = $user', {$user: username},(error2, resultUsers) => {
        age = resultUsers[0].age;
        gender = resultUsers[0].gender;
        res.send([age, gender]);
    })
})

//GET request to get collaborative filtering table
app.get('/getTable', function(req, res){
    res.send(collaborativeFilteringTable);
})

//GET request to retrieve all user behaviour
app.get('/getUserBehaviour', function(req, res){
    db.all('SELECT * FROM user_behaviour', (error, result) => {
        res.send(result);
    })
})

//GET request to retrieve all user behaviour
app.get('/getUsers', function(req, res){
    db.all('SELECT * FROM users', (error, result) => {
        res.send(result);
    })
})

//POST request to log user behaviour
app.post('/postUserBehaviour', function(req, res){
    db.run('INSERT INTO user_behaviour (userId, button, timestamp) VALUES ($userId, $button, $timestamp)', {
        $userId: username,
        $button: req.body.button,
        $timestamp: req.body.timestamp,
    })
    res.writeHead(200, {
        'Content-Type': 'application/json'
     });
    res.end(JSON.stringify({
        status: 'success',
    }));
})

//POST request to login
app.post('/login', function(req, res){
    //Ask database for list of all users
    db.all('SELECT username FROM users', (error, result) => {
        var index = -1;
        //Run through the usernames to see if it already exists
        for(var i=0; i<result.length; i++){
            //If it exists, logs in
            if(req.body.username === result[i].username){
                index = 1;
                username = req.body.username;
                res.send("Logged in as: " + req.body.username);
                break;
            }
        }
        //If it doesn't exist, asks to sign up
        if(index === -1){
            res.send("Not a valid user, please sign up");
        }
        
})
    })
    

//POST request to sign up
app.post('/signup', function(req, res){
    var index = -1;
    //Ask database for list of all users
    db.all('SELECT username FROM users', (error, result) => {
        //Run through the usernames to see if it already exists
        for(var i=0; i<result.length-1; i++){
            //If it exits set index to 1
            if(req.body.username === result[i].username){
                index = 1;
            }
        }
        //If it doesnt exist, add to users table
        if(index === -1){
            username = req.body.username;
            db.run('INSERT INTO users (username, gender, age) VALUES ($username, $gender, $age)', {
                $username: username,
            })
            res.send("Logged in as: " + req.body.username);
        }else{
            res.send("User already exists, please login or sign up using a different username");
        }
    })
    
})



//Closing the Database
// db.close( (err) => {
//     if(err){
//         return console.error(err.message);
//     }
//     console.log('Closed the database connection');
// });

//Exporting the module

module.exports = app;