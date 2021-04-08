// // server.js

// // BASE SETUP
// // =============================================================================

// // call the packages we need
// var express    = require('express');        // call express
// var app        = express();                 // define our app using express
// var bodyParser = require('body-parser');

// // configure app to use bodyParser()
// // this will let us get the data from a POST
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// var port = process.env.PORT || 9000;        // set our port

// // ROUTES FOR OUR API
// // =============================================================================
// var router = express.Router();              // get an instance of the express Router

// // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
// router.get('/login', function(req, res) {
//     res.json({ message: 'hooray! welcome to our api!' });   
// });

// // more routes for our API will happen here

// // REGISTER OUR ROUTES -------------------------------
// // all of our routes will be prefixed with /api
// app.use('/api', router);

// // START THE SERVER
// // =============================================================================
// app.listen(port);
// console.log('Magic happens on port ' + port);

var express = require('express');
var cors = require('cors');
const { Client } = require('pg');
var app = express();


var port = process.env.PORT || 9000; 
app.use(cors());
app.use(
    express.urlencoded({
      extended: true
    })
  );
  app.use(express.json());
var router = express.Router(); 

const GetConnection=function(){
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'testdb',
        password: '1234',
        port: 5432,
    });
    client.connect();
    return client;
}

const checkUser= async function(username){
    let select = `SELECT * FROM users where username='${username}'`;
  try{
    let client = GetConnection();
    let response = await client.query(select);
    client.end();
    return response.rows;
  }catch(e){
    console.log(e);
    return response;
  }
}
router.post('/login', async function (req, res, next) {
  
  try{
    let cred = req.body;
    let user =  await checkUser(cred.username);
    if(user.length){
        user = user[0];
        if(user.password == cred.password){
            res.json({
                status: 200,
                data: user,
                msg: "succss"
            })
        }
        res.json({
            status: 404,
            msg: "username or password incorrect"
        })
    }else{
        res.json({
            status: 404,
            msg: "user not found"
        })
    }
}catch(e){
    res.json({
        status: 500,
        msg: e
    })
 }
})

router.post('/register', async function (req, res, next) {
    
    try{
      let client = GetConnection();
      let user = req.body;
      let isUser = await checkUser(user.username);
      if( isUser.length != 0){
        res.json({
            status: 404,
            msg: "User already exist"
        })
      }
      let insert  = `
      INSERT INTO users (email, username, fullname, age,password)
      VALUES ('${user.email}','${user.username}', '${user.fullname}', ${user.age}, '${user.password}')
      `
      client.query(insert, (err, table) => {
          console.log(err,table);
          if (err) {
            res.json({
                    status: 404,
                    msg: err
            })
            return;
          }
           if(table){
              res.json({
                  status: 200,
                  data: table,
                  msg: "succss"
              })
           }else{
              res.json({
                  status: 404,
                  msg: table.rows
              })
           }
          client.end();
       });
    }catch(e){
      res.json({
          status: 501,
          msg: e
      })
    }
    
  })

app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);