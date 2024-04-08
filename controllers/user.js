const exphbs  = require('express-handlebars');
const bcrypt = require('bcrypt');
const db = require('../database').db;
const { io } = require('../carpool');
const bodyParser = require('body-parser');
const session = require('express-session');
const path=require('path');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JS_TOKEN_KEY;
const multer = require('multer');


const profilePhoto = (req,res)=>{
	const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
	const buffer = Buffer.from(base64Data, 'base64');
    const filename = req.body.userId + '.jpg';
	let stepBack = path.join(__dirname, '../');
	const directory = stepBack +  '/public/upload/'

    // Create a promise to remove the previous profile photo
    const removePreviousImage = new Promise((resolve, reject) => {
        db.query(`SELECT photo FROM Users WHERE id = '${req.body.userId}'`, function (err, result) {
            if (err) {
                reject(err);
            } else {
                if (result[0].photo) {
                    const path1 = directory + result[0].photo;
                    if (fs.existsSync(path1)) {
                        fs.unlink(path1, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                } else {
                    resolve();
                }
            }
        });
    });

    // Once the previous image is removed, save the new one
    removePreviousImage
    .then(() => {
        fs.writeFile(`${directory}${filename}`, buffer, 'base64', (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: 'Error saving the image' });
            } else {
                db.query(`UPDATE Users SET photo ='${filename}' WHERE id ='${req.body.userId}'; `, (err, rows) => {
                    if (!err) {
                        res.status(200).json({ message: 'Success' });
                    } else {
                        console.log(err);
                    }
                });
            }
        });
    })
    .catch((error) => {
        console.log(error);
        return res.status(500).json({ message: 'Error removing the previous image' });
    });
};

const messages = (req,res) =>{
    const token = req.headers.authorization;
    
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw(err);
                    }else{
                        db.query(`SELECT
                        IF(m.receiverId = ${tokenResult[0].userId}, m.senderId, m.receiverId) AS user_id,
                        u.name,
                        m.message,
                        u.photo,
                        m.timestamp
                        FROM messages m
                        JOIN (
                        SELECT
                            IF(receiverId = ${tokenResult[0].userId}, senderId, receiverId) AS other_user_id,
                            MAX(timestamp) AS last_timestamp
                        FROM messages
                        WHERE receiverId = ${tokenResult[0].userId} OR senderId = ${tokenResult[0].userId}
                        GROUP BY IF(receiverId = ${tokenResult[0].userId}, senderId, receiverId)
                        ) last_messages ON (m.timestamp = last_messages.last_timestamp)
                        JOIN Users u ON u.id = last_messages.other_user_id
                        WHERE (m.senderId = ${tokenResult[0].userId} OR m.receiverId = ${tokenResult[0].userId})
                        ORDER BY m.timestamp DESC;`, (err,messages)=>{
                            if (err) throw err;
                            for(var i = 0; i<messages.length; i++){
                                messages[i].timestamp = messages[i].timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                            }
                            console.log(messages);
                            var maxCharacters = 50; // Adjust this to your desired limit

                            messages.forEach(function (message) {
                                // Truncate the message field
                                message.truncatedMessage = (message.message.length > maxCharacters) ? message.message.slice(0, maxCharacters) + '...' : message.message;
                            });
                            console.log(messages);

                            res.render('messages',{layout: 'headerBottomMenu',
                                customstyle:'<link rel="stylesheet" href="/css/messages.css">',
                                headerTitle: "Your latests chats!",
                                userId: tokenResult[0].userId,
                                messages
                            });
                        });
                    }
                });
            }
        });
    }
};
  
const chat = (req,res) =>{
    const token = req.headers.authorization;
    
    if (!token){
        res.json({message:'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw(err);
                    }else{
                        db.query(`SELECT m.receiverId, m.senderId, m.timestamp, m.message, u.name, u.photo FROM messages AS m INNER JOIN Users AS u  where
                        ((senderId=${tokenResult[0].userId} AND receiverId =${req.params.userId}) OR (senderId = ${req.params.userId} AND receiverId =${tokenResult[0].userId} ))
                            AND m.senderId = u.id ORDER BY timestamp ASC`, (err, messages) => {
                        if (err) throw err;
                        for (var i = 0; i<messages.length; i++){
                            messages[i].timestamp = messages[i].timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                            messages[i].urlId = Number(req.params.userId);
                        }
                        db.query(`SELECT * FROM Users WHERE id = ${req.params.userId}`, (err,name) => {
                            if (err) throw err;
                            res.render('message',{layout: 'socketioLayoutHBM',
                            customstyle:'<link rel="stylesheet" href="/css/message.css">', 
                            customJs: '<script type="text/javascript" src="/js/messages.js"></script>',
                            headerTitle: name[0].name,
                            messages
                            });
                        });
                        })
                    }
                })
            }
        })
    }
};
    


//New controllers

const renderNewUser  = (req,res)=>{
    res.render('signup',{layout: 'logo',
    customstyle:'<link rel="stylesheet" href="/css/signup.css">', 
    title: 'Sign up'})
};

const newUser = async (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var password = req.body.password;
    var birthdate = req.body.birthdate;

    var hashedPassword = await bcrypt.hash(password, 10);
    db.query(`SELECT COUNT(*) AS cnt FROM Users WHERE email = '${email}';`, function(err,result){
        if (err) {
            console.log(err);
        }else{
            if (result[0].cnt!==0){
                res.json({message: 'There is an account with that email already!'});
            }else{
                const date = new Date(birthdate);
                const curDate = new Date();
                let age = curDate.getFullYear() - date.getFullYear();
                if (
                    curDate.getMonth() < date.getMonth() ||
                    (curDate.getMonth() === date.getMonth() && curDate.getDate() < date.getDate())
                  ) {
                    age--; // Adjust the age if the birthday hasn't occurred yet this year
                }
                if (age >= 16) {
                    db.query(`INSERT INTO Users(name, email,phoneNumber, reviewScore,password,birthdate,photo) VALUES
                    ('${name}', '${email}',${phone},0,'${hashedPassword}','${birthdate}', NULL);`, function(err){
                        if(err){
                            console.log(err);
                        }else{
                            res.json({message: 'Successfully registered!'});
                        }      
                    });
                  } else {
                    res.json({message: 'The date is not over 16 years ago.'});
                  }
            }
        }   
    });
};

const renderAuthUser  = (req,res) =>{
    res.render('login',{layout: 'logo',
        customstyle:'<link rel="stylesheet" href="/css/login.css">', 
        title: 'Login'})
};

const authUser = async(req,res) =>{
    var email = req.body.email;
    var password = req.body.password;
    if(!email){
        res.json({message: 'Please enter an email!'});
    }else if(!password){
        res.json({message: 'Please enter your password!'});
    }else{
        db.query( `SELECT id, email, password FROM Users WHERE email = '${email}';`,async function(err, results){
            if (err){
                throw(err)
            };
            if (!results[0]){
                res.json({message: 'No user found'});
            }else{
                const matching = await bcrypt.compare(password, results[0].password)
                if (!matching){
                    res.json({message: 'Wrong email or password'});
                }else{
                    const token = jwt.sign({ userId: results[0].id }, secretKey); // generate a JWT for the user
                    // store the token in the database along with the user's ID
                    db.query('INSERT INTO tokens (userId, token) VALUES (?, ?)', [results[0].id, token], (err, result) => {
                        if (err) throw err;
                        res.json({ token: token,id: results[0].id}); 
                        // send the token and success message back to the Cordova app
                    });
                }
            }
        });
    }
};

const renderHome = async (req,res) =>{
    const token = req.headers.authorization;
    if (!token) {
        res.json({message: 'Unauthorized'});
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err,token){

                    if (err){
                        throw(err);
                    }else{
                        db.query(`SELECT * FROM Users WHERE id = '${token[0].userId}'`, function(err,result){
                            if (err){
                                throw(err);
                            }else{
                                db.query(`SELECT * FROM Alerts WHERE userId='${token[0].userId}' AND alertRead=0`, function(err,notif){
                                    if (err){
                                        throw(err)
                                    } else{
                                        if(notif.length > 0){
                                            res.render('home',{layout:'home',
                                                userId: token[0].userId,
                                                message:'You have new notifications!',
                                                result});
                                        }else{
                                            res.render('home',{layout:'home',
                                            userId: token[0].userId,
                                            result});
                                        }
                                    }
                                    
                                })
                                
                            }
                        });
                    }
                });
            }
        });
    }
};

const userProfile = (req,res) =>{
    const token = req.headers.authorization;
    const userId = req.params.userId;
    
    if (!token) {
        res.json({message: 'Unauthorized'});    
    }else{
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                res.json({message: 'Problem'});
            }else{
                db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
                    if (err){
                        throw(err);
                    }else{
                        if (tokenResult[0].userId == userId){
                            //render with change profile photo button
                            db.query(`SELECT * FROM users WHERE id = '${userId}'`, function(err,  result){
                                if (err) {
                                    throw(err)
                                }else{
                                    db.query(`SELECT AVG(reviewScore) avg FROM reviews WHERE revieweeId='${userId}';`, function(err, average){
                                        if (err){
                                            throw(err)
                                        }else{
                                            let x = Math.round(average[0].avg);
                                            let yellowStars = _.range(x);
                                            let blackStars = _.range(5-x);
                                            res.render('usersProfile',{layout: 'headerBottomMenu',
                                                customstyle: '<link rel="stylesheet" href="/css/profile.css">',
                                                title: result[0].name,
                                                reviewStars: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">',
                                                headerTitle: result[0].name,
                                                userId: userId,
                                                result, 
                                                yellowStars,
                                                blackStars
                                            });
                                        }
                                    })
                                }
                            });
                        }else{
                            //render without "change profile photo" button and with message user button
                            db.query(`SELECT * FROM users WHERE id = '${userId}'`, function(err,  result){
                                if (err) {
                                    throw(err)
                                }else{
                                    db.query(`SELECT AVG(reviewScore) avg FROM reviews WHERE revieweeId='${userId}';`, function(err, average){
                                        if (err){
                                            throw(err)
                                        }else{
                                            let x = Math.round(average[0].avg);
                                            let yellowStars = _.range(x);
                                            let blackStars = _.range(5-x);
                                            res.render('profile',{layout: 'headerBottomMenu',
                                                customstyle: '<link rel="stylesheet" href="/css/profile.css">',
                                                title: 'Users Profile',
                                                reviewStars: '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">',
                                                headerTitle: result[0].name,
                                                result,
                                                userId: userId,
                                                yellowStars,
                                                blackStars
                                            });
                                        }
                                    })
                                }
                            });
                        }
                    }
                })
            }
        });
    }
};

const notifications = (req,res)=>{
    const token = req.headers.authorization;
    
    if (!token) {
        res.json({message: 'Unauthorized'});    
    }else{
        db.query(`SELECT * FROM tokens WHERE token = '${token}'`, function(err, tokenResult){
            if (err) {
                throw(err)
            }else{
                db.query(`SELECT * FROM Alerts INNER JOIN Users U ON Alerts.creatorId = U.id WHERE userId = '${tokenResult[0].userId}'`, function (err, notifications){
                    if(err){
                        throw(err);
                    }else{
                        db.query(`UPDATE Alerts SET alertRead =1 WHERE userId = '${tokenResult[0].userId}'`, function (err){
                            if (err){
                                throw(err);
                            }else{
                                res.render('notifications', {layout:'headerBottomMenu',
                                customstyle:'<link rel="stylesheet" href="/css/notifications.css">',
                                title: 'Notifications',
                                headerTitle:'Notifications',
                                userId: tokenResult[0].userId,
                                notifications});
                            }
                        })
                    }
                });
            }
        })
    }
};

const logoutUser = (req, res) => {
    const token = req.headers.authorization;
    if (!token){
        res.json({message: 'Unauthorized'});
    }else{
        db.query(`delete from tokens where token = '${token}'`, function(err,token){
            if (err){
                throw(err);
            }else{
                res.json({message: 'Successfully logged out'});
            }
    })}
};

module.exports = {
    renderHome,
    newUser,
    authUser,
    renderNewUser,
    renderAuthUser,
    logoutUser,
    userProfile,
    profilePhoto,
    notifications,
    messages,
    chat
};