var express = require('express')
  , app = express()  
  , server = require('http').createServer(app)
  , path = require('path')
  , io = require('socket.io').listen(server)
  , cp = require('child_process')
  , omx = require('omxcontrol');

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'tardis', autoload: true });

function mediaPlayerStart(youtubeUrl) {
  var player = cp.spawn('mplayer',['-slave','-cache','16384','-fs',youtubeUrl.trim()]);
  //var player = cp.spawn('omxplayer',[youtubeUrl.trim()]);16384
    console.log('### START PLAYER ###');
  player.stdout.on('data', function (data) {
    // send commands
    //mplayer.stdin.write('\nmute')
  });
};

function youtube(mediaUrl) {
  cp.exec('youtube-dl -g -f 34/35/45/84 '+mediaUrl,function (error, stdout, stderr,stdin) {
    // -f choise prefeard video format http://en.wikipedia.org/wiki/YouTube#Quality_and_codecs
   if (error) {
     console.log(error.stack);
     console.log('Error code: '+error.code);
     console.log('Signal received: '+error.signal);
   }
   if (stdout) {
      mediaPlayerStart(stdout)
   };
 });
};

// all environments
app.set('port', process.env.TEST_PORT || 8080);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(omx());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Routes
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/remote', function (req, res) {
  res.sendfile(__dirname + '/public/remote.html');
});

app.get('/playlist', function (req, res) {

  db.find({}, function (err, docs) {
    console.log(docs);
    return res.send(docs);
  });
});

//Socket.io Config
io.set('log level', 1);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var ss;

//Socket.io Server
io.sockets.on('connection', function (socket) {

 socket.on("screen", function(data){
   socket.type = "screen";
   ss = socket;
   console.log("Screen ready...");
 });

 socket.on("remote", function(data){
   socket.type = "remote";
   console.log("Remote ready...");
 });

 socket.on("controll", function(data){
	console.log(data);
   if(socket.type === "remote"){
      console.log(data);
   }
 });

 socket.on("video", function(data){

    if( data.action === "play"){
    console.log(data);

    var db_id = db.insert(data, function (err, newDoc) {   
      console.log(newDoc);
      // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    });

    console.log(db_id);

    var id = data.youtube_id,
        url = "http://www.youtube.com/watch?v="+id;
        youtube(url)
    };
 });


});
