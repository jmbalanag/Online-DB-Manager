var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var port = process.env.PORT || 8080;

const sql = require('mssql/msnodesqlv8');

app.use(bodyParser.json());

app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType, Content-Type, Accept, Authorization");

    next();
})

var config = {}

var executeQuery = function(res, query){
    sql.connect(config, function(err){
        if(err){
            console.log("Error Connecting database: " + err);
            sql.close();

            return res.status(200).json({code: '1001', message: 'Server details not yet configured'});
        }else{
            var request = new sql.Request();

            request.query( query, function (err, data){
                if(err){
                    console.log("Error in query return: " + err);
                    sql.close();

                    return  res.status(200).json({code: '1002', message: 'ERROR: ' + err});
                }else{
                    sql.close();

                    //return  res.send(data.recordset);
                    return  res.status(200).json({code: '1717', message: 'Query Completed', data: data.recordsets[0]});
                }
            });
        }


    });
}


app.get('/api/server', function(req,res){
    var query = "SELECT @@SERVERNAME as 'server_name'";
    executeQuery (res, query);
});


var config = {
    user: 'dbaph_dev',
    password: 'projectROS2018',
    server: 'DVMXC021.dev.sprint.com',
    port: 2787,
    options: {
        encrypt: false
    }
}

// function queryToServer(userQuery){
//     sql.connect(config, function (err) {
//         if (err) {
//             console.log('Connection Error: ');
//             console.log(err);
//         }else{
//             console.log("Connected to " + config.server);
//         }
//     });
// }

app.use(express.static(__dirname + '/client/'));

app.get('/', function(req,res){
    console.log('Server is running ..');
});


// app.get('/api/server', function(req,res){
//     queryToServer( "SELECT @@SERVERNAME as 'server_name'", function(ret){
//         console.log("this:" + ret);
//     });

// });

// app.get('*', function(req,res){
//    // res.sendFile('/client/index.html');
// });

app.listen(port);
console.log("App Listening on port 8080");