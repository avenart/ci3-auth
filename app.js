var express = require('express')
var app = express()
var server = require('http').Server(app)
var mysql = require('mysql')
var PHPUnserialize = require('php-unserialize')
var us = require('underscore')._
var io = require('socket.io')(server)

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'test'
})
 
db.connect(function(err){
    if (err) console.log(err)
})

server.listen(3000, function(){
    console.log('Server listening on *:3000')   
})

app.use(express.static(__dirname+'/public'))

var usernames = []
var clients = []
var users = []

io.sockets.on('connection', function(socket){
connect(socket)

socket.on('disconnect', function() {
disconnect(socket)
})

})



function parseCookies(request){
var result={}
request.split(/;\s+/).forEach(function(e){
var parts=e.split(/=/,2)
result[parts[0]]=parts[1]||''
})
sessionCookieName='ci_session',
sessionId=result[sessionCookieName]||''
return sessionId
}

function connect(socket){

var rcookie = socket.handshake.headers['cookie']
var cookies = parseCookies(rcookie)

if(cookies) {
var session_id = cookies

if(session_id) {

db.query('SELECT * FROM ci_sessions WHERE id="' + session_id + '" LIMIT 1', function(err, result){

if (err) throw err

var data = result[0]

if(data.data) {

var userdata = new Buffer(data.data, 'binary' ).toString('utf-8')
var userdata = PHPUnserialize.unserializeSession(userdata)

socket.user_id = userdata.user_id
socket.username = userdata.username

var data = new Object()
data.userid = socket.user_id
data.username = socket.username

var lf = { username: data.username }
if(us.findWhere(usernames, lf)) {
// duplicate!!!

} else {
usernames.push(data)
socketCount = usernames.length
}

io.sockets.emit('users connected', socketCount )
io.sockets.emit('usernames connected', usernames )
clients[data.userid] = socket
} 
})
}
}
}

function disconnect(socket) {
var o = us.findWhere(usernames, {'username': socket.username})
usernames = us.without(usernames, o)
socketCount = usernames.length
io.sockets.emit('users connected', socketCount )
io.sockets.emit('usernames connected', usernames )
}

