const db = require('../database').db;
const _ = require('lodash'); 
const jwt = require('jsonwebtoken');
const secretKey = process.env.JS_TOKEN_KEY;

//New functions

const renderNewRide = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                res.render('create', {layout: 'headerBottomMenu',
                customstyle:'<link rel="stylesheet" href="/css/create.css">',
                title: 'Create a ride',
                headerTitle:'Create a ride',
                customJS: '<script type="text/javascript" src="/js/create.js"></script>',
                userId: req.session.userId,
                autocompleteAPI: process.env.AUTOCOMPLETE_API_KEY})
            }
        })
    }
};

const renderSearchRide = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                res.render('search', {
                    layout: 'headerBottomMenu',
                    customstyle : '<link rel="stylesheet" href="/css/search.css">',
                    title: 'Search',
                    headerTitle: 'Search for a ride',
                    userId: req.session.userId,
                    autocompleteAPI: process.env.AUTOCOMPLETE_API_KEY
                })
            }
        })
    }
};

const renderPastRidesSelect = (req,res) =>{
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                    res.render('pastRidesSelect', {layout: 'headerBottomMenu',
                    customstyle: '<link rel="stylesheet" href="/css/pastRidesSelect.css">',
                    title:'Past Rides',
                    userId: req.session.userId,
                    headerTitle: 'Past Rides'
                    })
            }
        })
    }
}

const renderUpcomingRidesSelect = (req,res) =>{
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                res.render('upcomingRidesSelect', {layout: 'headerBottomMenu',
                    customstyle: '<link rel="stylesheet" href="/css/past_rides.css">',
                    title:'Upcoming Rides',
                    userId: req.session.userId,
                    headerTitle: 'Upcoming Rides'
                })
            }
        })
    }
}

const start = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw err;
                    }else{
                        var date = new Date();
                        day= date.getDate();
                        month= date.getMonth()+1;
                        year= date.getFullYear();
                        curDate = year + '-' + month +   '-' + day;
                        db.query(`SELECT R.id, R.destination,R.driverId, R.freeSeats, R.passengers, R.startingPoint, R.timeAndDate, U.name, U.photo FROM Rides as R LEFT JOIN Users as U on R.driverId = U.id WHERE 
                        timeAndDate = '${curDate}' AND driverId = ${tokenResult[0].userId} AND done = 'no';`, function(err,rides){
                            if (err){
                                throw (err)
                            }else{
                                rides.forEach(function(rides){
                                    day= rides.timeAndDate.getDate();
                                    month = rides.timeAndDate.getMonth() + 1;
                                    year= rides.timeAndDate.getFullYear();
                                    rides.timeAndDate = day + '/' + month + '/' + year;
                                });
                                
                                res.render('start', {layout: 'headerBottomMenu',
                                customstyle: '<link rel="stylesheet" href="/css/past_rides.css">',
                                title:'Todays Rides',
                                headerTitle: 'Todays rides',
                                ride: rides,
                                userId: tokenResult[0].userId,
                                num: rides.length});
                            }
                        });
                    }    
                })
            }
        })
    }

    
};

const renderPastRidesDriver = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw err;
                    }else{
                        var date = new Date();
                        day= date.getDate();
                        month= date.getMonth()+1;
                        year= date.getFullYear();
                        curDate = year + '-' + month +   '-' + day;
                        db.query(`SELECT R.*, U.photo AS driverPhoto
                        FROM Rides R
                        INNER JOIN Users U ON R.driverId = U.id
                        WHERE R.driverId = '${tokenResult[0].userId}'
                          AND R.timeAndDate <= '${curDate}'
                          AND R.done = 'yes';`, function(err, rides){
                            if (err){
                                throw (err);
                            }else{
                                for (var i=0; i<rides.length; i++){
                                    day= rides[i].timeAndDate.getDate();
                                    month = rides[i].timeAndDate.getMonth() + 1;
                                    year= rides[i].timeAndDate.getFullYear();
                                    rides[i].timeAndDate = day + '/' + month + '/' + year;     
                                }
                                res.render('pastRidesDriver', {layout: 'headerBottomMenu',
                                customstyle: '<link rel="stylesheet" href="/css/past_rides.css">',
                                title:'Past Rides',
                                headerTitle: 'Past rides',
                                userId: tokenResult[0].userId,
                                ride: rides,
                                num: rides.length})

                            }

                        })
                    }
                })
            }
        })
    }
}

const renderPastRidesPassenger = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw err;
                    }else{
                        var date = new Date();
                        day= date.getDate();
                        month= date.getMonth()+1;
                        year= date.getFullYear();
                        curDate = year + '-' + month +   '-' + day;
                        db.query(`SELECT R.*, U.name AS driverName, U.photo AS driverPhoto
                        FROM Rides R
                        INNER JOIN Go G ON G.rideId = R.id
                        INNER JOIN Users U ON R.driverId = U.id
                        WHERE G.passengerId = '${tokenResult[0].userId}'
                          AND R.timeAndDate <= '${curDate}'
                          AND R.done = 'yes';`, function(err, rides){
                            if (err){
                                throw (err);
                            }else{
                                for (var i=0; i<rides.length; i++){
                                    day= rides[i].timeAndDate.getDate();
                                    month = rides[i].timeAndDate.getMonth() + 1;
                                    year= rides[i].timeAndDate.getFullYear();
                                    rides[i].timeAndDate = day + '/' + month + '/' + year;     
                                }
                                res.render('pastRidesPassenger', {layout: 'headerBottomMenu',
                                customstyle: '<link rel="stylesheet" href="/css/past_rides.css">',
                                title:'Past Rides',
                                headerTitle: 'Past rides',
                                userId: tokenResult[0].userId,
                                ride: rides,
                                num: rides.length})
                            }
                            
                        })
                    }
                })
            }
        })
    }
}

const renderPastRideDriver = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{    
                rideId = req.params.rideId;
                db.query(`SELECT * FROM Rides WHERE id = ${rideId}`, function(err,ride){
                    if (err) {
                        throw (err);
                    }else{        
                        day= ride[0].timeAndDate.getDate();
                        month = ride[0].timeAndDate.getMonth() + 1;
                        year= ride[0].timeAndDate.getFullYear();
                        ride[0].timeAndDate = day + '/' + month + '/' + year;
                        db.query(`SELECT * FROM Users WHERE id = ${ride[0].driverId}`, function(err, driver){
                            if (err){
                                throw (err);
                            }else{
                                db.query(`SELECT name, id FROM users WHERE id IN (select passengerId from Go where rideId = ${ride[0].id})`, function(err, passenger){
                                if (err){
                                    throw (err)
                                }else{
                                    res.render('pastRideDriver', {layout: 'headerBottomMenu',
                                    customstyle: '<link rel="stylesheet" href="/css/single_past_ride.css">',
                                    ride,
                                    headerTitle:'Ride No: ' + ride[0].id,
                                    driver,
                                    passenger
                                    });
                                }
                                })
                                
                            }
                        })
                    }
                })
            }
        })
    }
}

const renderPastRidePassenger = (req,res) =>{
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                rideId = req.params.rideId;
                db.query(`SELECT * FROM Rides WHERE id =${rideId}`, function(err,ride){
                    if (err){
                        throw(err);
                    }else{
                        day= ride[0].timeAndDate.getDate() ;
                        month = ride[0].timeAndDate.getMonth()+1;
                        year= ride[0].timeAndDate.getFullYear();
                        ride[0].timeAndDate = day + '/' + month + '/' + year;
                        db.query(`SELECT * FROM Users WHERE id = ${ride[0].driverId}`, function(err, driver){
                            if (err){
                                throw (err);
                            }else{
                                db.query(`SELECT name, id FROM users WHERE id IN (select passengerId from Go where rideId = ${ride[0].id})`, function(err, passenger){
                                    if (err){
                                        throw (err)
                                    }else{
                                        res.render('pastRidePassenger', {layout: 'headerBottomMenu',
                                        customstyle: '<link rel="stylesheet" href="/css/single_past_ride.css">',
                                        userId: req.session.userId,
                                        ride,
                                        headerTitle:'Ride No: ' + ride[0].id,
                                        driver,
                                        passenger
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    }
}

const renderReviewRide = (req,res)=>{
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw(err);
                    }else{
                        db.query(`SELECT reviewed FROM Go WHERE rideId = ${req.params.rideId} AND passengerId = ${tokenResult[0].userId}`, function (err, result){
                            if (err){
                                throw err
                            }else{
                                if (result[0].reviewed === 1){
                                    res.send("Reviewed");
                                }else{
                                    res.render('review',{layout:'header',
                                    customstyle:'<link rel="stylesheet" href="/css/review.css">',
                                    title:'Review ride',
                                    headerTitle:'Review ride'});
                                }
                            }
                        })
                    }
                });
            }
        })
    }
}

const newRide = async (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw err;
                    }else{
                        var destination = req.body.destination;
                        var startingPoint = req.body.departure;
                        var date = req.body.date;
                        var freeSeats = req.body.freeSeats;
                        timeAndDate = new Date(date);

                        var formattedDate =
                            timeAndDate.getFullYear() +
                            '-' +
                            String(timeAndDate.getMonth() + 1).padStart(2, '0') +
                            '-' +
                            String(timeAndDate.getDate()).padStart(2, '0') +
                            ' ' +
                            String(timeAndDate.getHours()).padStart(2, '0') +
                            ':' +
                            String(timeAndDate.getMinutes()).padStart(2, '0') +
                            ':' +
                            String(timeAndDate.getSeconds()).padStart(2, '0');

                        db.query(`SELECT * FROM Users WHERE id='${tokenResult[0].userId}';`, function(err,results){
                            if(err){
                                res.json({message: 'Error'});
                            }else{
                                driverId = results[0].id;
                                db.query(`INSERT INTO Rides (destination , driverId, freeSeats, passengers, startingPoint, timeAndDate, done) VALUES
                                ('${destination}', ${driverId}, ${freeSeats}, 0,'${startingPoint}', '${formattedDate}' , 'no' ) ;`, function(err){
                                    if(err){
                                        console.log(err);
                                        res.json({message: 'Error'});
                                    }else{
                                        res.json({message: 'Success'});
                                    }      
                                })
                            }
                        })
                    }
                })
            }
        })
    }
};

const searchRide = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw err;
                    }else{
                        var destination = req.body.destination;
                        var departurePoint = req.body.departure;
                        var date = req.body.date;
                        var seats = req.body.freeSeats;
                        db.query(`SELECT R.*, U.photo AS photo
                        FROM Rides R
                        LEFT JOIN Go G ON R.id = G.rideId AND G.passengerId =  ${tokenResult[0].userId}
                        LEFT JOIN Users U ON R.driverId = U.id
                        WHERE R.destination = '${destination}'
                          AND R.startingPoint = '${departurePoint}'
                          AND R.timeAndDate >= '${date}'
                          AND R.freeSeats >= ${seats}
                          AND R.driverId != ${tokenResult[0].userId}
                          AND G.rideId IS NULL;`, function (err, rides){
                                if (err){
                                    return (err);
                                }else{
                                    rides.forEach(function(rides){
                                        day= rides.timeAndDate.getDate();
                                        month = rides.timeAndDate.getMonth() + 1;
                                        year= rides.timeAndDate.getFullYear();
                                        rides.timeAndDate = day + '/' + month + '/' + year;
                                    });
                                    res.render('ridesFound', {layout: 'headerBottomMenu',
                                    customstyle: '<link rel="stylesheet" href="/css/past_rides.css">',
                                    title:'Rides Found',
                                    headerTitle: 'Rides Found',
                                    userId: tokenResult[0].userId,
                                    ride: rides,
                                    num: rides.length})
                                }
                        });
                    }
                });
            }
        })
    }
};

const bookRide = (req,res) =>{
    
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
                throw err;
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        res.json({message: 'Problem'});
                        throw err;
                    }else{
                        rideId = req.body.rideId;
                        passengerId = req.body.userId;
                        seats = req.body.seats;
                        db.query(`SELECT driverId FROM Rides WHERE id='${rideId}'`, function(err, row){
                            if (err){
                                res.json({message: 'Problem'});
                                throw err;
                            }else{
                                db.query(`INSERT INTO Go(driverId, passengerId, rideId, seats, reviewed) VALUES ('${row[0].driverId}','${passengerId}','${rideId}','${seats}', 0);`, function(err){
                                    if (err){
                                        res.json({message: 'Problem'});
                                        throw err;
                                    }else{
                                        db.query(`UPDATE Rides SET freeSeats = freeSeats - '${seats}', passengers= passengers + '${seats}' where id='${rideId}'`, function(err){
                                            if (err){
                                                res.json({message: 'Problem'});
                                                throw err;
                                            }else{
                                                db.query(`INSERT INTO Alerts(userId, alertText, alertRead,  rideId, creatorId) VALUES ('${row[0].driverId}',"booked ${seats} seats for",0,'${rideId}', '${passengerId}')`, function(err){
                                                    if (err){
                                                        res.json({message: 'Problem'});
                                                        throw err;
                                                    }else{
                                                        db.query(`SELECT * FROM Users WHERE id = '${passengerId}'`, function(err,result){
                                                            if (err){
                                                                res.json({message: 'Problem'});
                                                                throw err;
                                                            }else{
                                                                res.json({message: 'success'});
                                                            }
                                                        });
                                                    }
                                                })
                                                
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                })
            }
        })
    }
}

const renderUpcomingRidesDriver = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw err;
                    }else{
                        var date = new Date();
                        day= date.getDate();
                        month= date.getMonth()+1;
                        year= date.getFullYear();
                        curDate = year + '-' + month +   '-' + day;
                        db.query(`SELECT R.*, U.photo AS photo
                        FROM Rides R
                        INNER JOIN Users U ON R.driverId = U.id
                        WHERE R.driverId = '${tokenResult[0].userId}' 
                          AND R.timeAndDate >= '${curDate}' 
                          AND R.done = 'no' 
                        ORDER BY R.timeAndDate;`, function(err, rides){
                            if (err){
                                throw (err);
                            }
                            for (var i=0; i<rides.length; i++){
                                day= rides[i].timeAndDate.getDate();
                                month = rides[i].timeAndDate.getMonth() + 1;
                                year= rides[i].timeAndDate.getFullYear();
                                rides[i].timeAndDate = day + '/' + month + '/' + year;
                            }
                            res.render('upcomingRidesDriver', {layout: 'headerBottomMenu',
                            customstyle: '<link rel="stylesheet" href="/css/past_rides.css">',
                            title:'Upcoming Rides',
                            headerTitle: 'Upcoming rides',
                            ride: rides,
                            userId: tokenResult[0].userId,
                            num: rides.length})
                        })
                    }
                })
            }
        })
    }
};

const renderUpcomingRidesPassenger = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw err;
                    }else{
                        var date = new Date();
                        day= date.getDate();
                        month= date.getMonth()+1;
                        year= date.getFullYear();
                        curDate = year + '-' + month +   '-' + day;
                        db.query(`SELECT R.*, U.name AS driverName, U.photo AS photo
                        FROM Rides R
                        INNER JOIN Go G ON G.rideId = R.id
                        INNER JOIN Users U ON R.driverId = U.id
                        WHERE G.passengerId = '${tokenResult[0].userId}'
                          AND R.timeAndDate >= '${curDate}'
                          AND R.done = 'no';`, function(err, rides){
                            if (err){
                                throw (err);
                            }else{
                                for (var i=0; i<rides.length; i++){
                                    day= rides[i].timeAndDate.getDate();
                                    month = rides[i].timeAndDate.getMonth() + 1;
                                    year= rides[i].timeAndDate.getFullYear();
                                    rides[i].timeAndDate = day + '/' + month + '/' + year;
                                }
                                res.render('upcomingRidesDriver', {layout: 'headerBottomMenu',
                                customstyle: '<link rel="stylesheet" href="/css/past_rides.css">',
                                title:'Upcoming Rides',
                                headerTitle: 'Upcoming rides',
                                ride: rides,
                                userId: tokenResult[0].userId,
                                num: rides.length})
                            }
                            
                        })
                    }
                })
            }
        })
    }
}

const renderUpcomingRideDriver = (req,res) =>{
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{    
                rideId = req.params.rideId;
                db.query(`SELECT * FROM Rides WHERE id = ${rideId}`, function(err,ride){
                    if (err) {
                        throw (err);
                    }else{        
                        day= ride[0].timeAndDate.getDate();
                        month = ride[0].timeAndDate.getMonth() + 1;
                        year= ride[0].timeAndDate.getFullYear();
                        ride[0].timeAndDate = day + '/' + month + '/' + year;
                        db.query(`SELECT * FROM Users WHERE id = ${ride[0].driverId}`, function(err, driver){
                            if (err){
                                throw (err);
                            }else{
                                db.query(`SELECT name, id FROM users WHERE id IN (select passengerId from Go where rideId = ${ride[0].id})`, function(err, passenger){
                                if (err){
                                    throw (err)
                                }else{
                                    res.render('upcomingRideDriver', {layout: 'headerBottomMenu',
                                    customstyle: '<link rel="stylesheet" href="/css/single_past_ride.css">',
                                    ride,
                                    headerTitle:'Ride No: ' + ride[0].id,
                                    driver,
                                    passenger
                                    });
                                }
                                })
                                
                            }
                        })
                    }
                })
            }
        })
    }

    // rideId = req.params.rideId;
    // db.query(`SELECT * FROM Rides WHERE id = ${rideId}`, function(err,ride){
    //     if (err) {
    //         throw (err);
    //     }else{        
    //         day= ride[0].timeAndDate.getDate() ;
    //         month = ride[0].timeAndDate.getMonth() + 1;
    //         year= ride[0].timeAndDate.getFullYear();
    //         ride[0].timeAndDate = day + '/' + month + '/' + year;
    //         db.query(`SELECT * FROM Users WHERE id = ${ride[0].driverId}`, function(err, driver){
    //             if (err){
    //                 throw (err);
    //             }else{
    //                 db.query(`SELECT name, id FROM users WHERE id IN (select passengerId from Go where rideId = ${ride[0].id})`, function(err, passenger){
    //                     if (err){
    //                         throw (err)
    //                     }else{
    //                         res.render('upcomingRideDriver', {layout: 'headerBottomMenu',
    //                         customstyle: '<link rel="stylesheet" href="/css/single_past_ride.css">',
    //                         ride,
    //                         userId: req.session.userId,
    //                         driver,
    //                         passenger
    //                         });
    //                     }
    //                 })
    //             }
    //         })
    //     }
    // })
}

const renderUpcomingRidePassenger = (req,res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err){
                res.json({message: 'Problem'});
            }else{
                rideId = req.params.rideId;
                db.query(`SELECT * FROM Rides WHERE id =${rideId}`, function(err,ride){
                    if (err){
                        throw(err);
                    }else{
                        day= ride[0].timeAndDate.getDate() ;
                        month = ride[0].timeAndDate.getMonth()+1;
                        year= ride[0].timeAndDate.getFullYear();
                        ride[0].timeAndDate = day + '/' + month + '/' + year;
                        db.query(`SELECT * FROM Users WHERE id = ${ride[0].driverId}`, function(err, driver){
                            if (err){
                                throw (err);
                            }else{
                                db.query(`SELECT name, id FROM users WHERE id IN (select passengerId from Go where rideId = ${ride[0].id})`, function(err, passenger){
                                    if (err){
                                        throw (err)
                                    }else{
                                        res.render('upcomingRideDriver', {layout: 'headerBottomMenu',
                                        customstyle: '<link rel="stylesheet" href="/css/single_past_ride.css">',
                                        userId: req.session.userId,
                                        ride,
                                        headerTitle:'Ride No: ' + ride[0].id,
                                        driver,
                                        passenger
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    }

    // rideId = req.params.rideId;
    // db.query(`SELECT * FROM Rides WHERE id = ${rideId}`, function(err,ride){
    //     if (err) {
    //         throw (err);
    //     }else{        
    //         day= ride[0].timeAndDate.getDate();
    //         month = ride[0].timeAndDate.getMonth() + 1;
    //         year= ride[0].timeAndDate.getFullYear();
    //         ride[0].timeAndDate = day + '/' + month + '/' + year;
    //         db.query(`SELECT * FROM Users WHERE id = ${ride[0].driverId}`, function(err, driver){
    //             if (err){
    //                 throw (err);
    //             }else{
    //                 db.query(`SELECT name, id FROM users WHERE id IN (select passengerId from Go where rideId = ${ride[0].id})`, function(err, passenger){
    //                     if (err){
    //                         throw (err)
    //                     }else{
    //                         res.render('upcomingRideDriver', {layout: 'headerBottomMenu',
    //                         customstyle: '<link rel="stylesheet" href="/css/single_past_ride.css">',
    //                         ride,
    //                         driver,
    //                         userId: req.session.userId,
    //                         passenger
    //                         });
    //                     }
    //                 })
    //             }
    //         })
    //     }
    // })
}

const reviews = (req,res) => {
    const token = req.headers.authorization;
    if (!token) {
        res.json({message: 'Unauthorized'});
    } else {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.json({message: 'Problem'});
            } else {
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult) {
                    if (err) {
                        throw err;
                    } else {
                        db.query(`SELECT r.reviewScore, r.reviewText, u.name, u.id, r.reviewerId 
                        FROM reviews AS r INNER JOIN Users AS u ON u.id=r.reviewerId 
                        WHERE r.revieweeId=${req.params.userId}`, function (err, reviews) {
                            if (err) {
                                throw (err);
                            } else {
                                if (_.isEmpty(reviews)) {
                                    res.send('No reviews');
                                } else {
                                    res.render('userReviews', {
                                        layout: 'headerBottomMenu',
                                        title: 'Reviews',
                                        headerTitle: 'Reviews',
                                        customstyle: '<link rel="stylesheet" href="/css/userReviews.css">',
                                        userId: tokenResult[0].userId,
                                        reviews
                                    });
                                }
                            }
                        })
                    }
                })
            }
        })
    }
};

const reviewRide = (req,res) =>{
    score = req.body.stars;
    text = req.body.text;
    rideId = req.body.rideId;
    reviewerId = req.body.userId;
    db.query(`select driverId from rides where id= ${rideId}`, function(err, id){
        if(err){
            throw err
        }else{
            driverId = id[0].driverId;

            db.query(`INSERT INTO reviews(reviewerId, revieweeId, rideId, reviewScore, reviewText) VALUES (${reviewerId},${driverId}, ${rideId}, ${score}, '${text}')`, function(err){
                if(err){
                    throw err
                }else{
                    db.query(`UPDATE Go SET reviewed = 1 WHERE rideId = ${rideId} AND passengerId = ${reviewerId}`, function (err){
                        if (err) {
                            throw (err)
                        }else{
                            res.json({message: 'Success'});
                        }
                    })

                }
            })
        }


    });
};

//Old functions

const searchedRideInfo = (req, res) => {
    rideId = req.params.rideId;
    db.query(`SELECT * FROM Rides WHERE id =${rideId}`, function(err,ride){
        if (err){
            throw(err);
        }else{
            day= ride[0].timeAndDate.getDate();
            month = ride[0].timeAndDate.getMonth() + 1;
            year= ride[0].timeAndDate.getFullYear();
            ride[0].timeAndDate = day + '/' + month + '/' + year;
            db.query(`SELECT * FROM Users WHERE id = ${ride[0].driverId}`, function(err, driver){
                if (err){
                    throw (err);
                }else{
                    db.query(`SELECT name, id FROM users WHERE id IN (select passengerId from Go where rideId = ${ride[0].id})`, function(err, passenger){
                        if (err){
                            throw (err)
                        }else{
                            req.session.rideId = ride[0].id;
                            res.render('searchedRide', {layout: 'headerBottomMenu',
                                customstyle: '<link rel="stylesheet" href="/css/single_past_ride.css">',
                                ride,
                                userId: req.session.userId,
                                headerTitle: 'Ride No' + ride[0].id,
                                driver,
                                passenger
                                });
                        }
                    });
                }
            });
        }
    });
}

const ride = (req,res) =>{
    db.query(`SELECT * FROM Rides WHERE id = ${req.params.rideid}`, function (err, result){
        if (err) {
            throw (err)
        }else{
            origin = '\"' + result[0].startingPoint + '\"'
            destination = '\"' + result[0].destination + '\"'
            res.render('ride',{layout: 'header',
            title:'Ride',
            customstyle:'<link rel="stylesheet" href="/css/ride.css">',
            headerTitle: 'Ride No ' + req.params.rideid,
            origin : origin ,
            destination: destination,
            id: req.params.rideid,
            API: process.env.API_KEY});
        }  
    });
};

const endRidePOST = (req,res) => {
    db.query(`UPDATE Rides SET done = 'yes' WHERE id = ${req.params.rideId};`, function (err, update){
        if (err){
            throw (err);
        }else{
            res.send('Success');
        }
    });
};



module.exports = {
    newRide,
    renderNewRide,
    searchRide,
    renderSearchRide,
    renderPastRidesSelect,
    renderPastRidesDriver,
    renderPastRidesPassenger,
    renderPastRideDriver,
    renderPastRidePassenger,
    renderUpcomingRidesSelect,
    renderUpcomingRidesDriver,
    renderUpcomingRidesPassenger,
    renderUpcomingRideDriver,
    renderUpcomingRidePassenger,
    searchedRideInfo,
    bookRide,
    renderReviewRide,
    reviewRide,
    reviews,
    ride,
    endRidePOST,
    start
};

//res.json({message: 'Problem'});