var cp = require('child_process');
var Media = require('simple-mplayer');
var mediaUrl = "http://www.youtube.com/watch?v=oOlDewpCfZQ";

function callback(youtubeUrl) {
	var mplayer = cp.spawn('mplayer',['-slave','-fs',youtubeUrl.trim()]);
	//console.log(mplayer.pid);
	
	mplayer.stdout.on('data', function (data) {
  	console.log('stdout: ' + data);
/*		setTimeout(function() {
			console.log('mute');
			mplayer.stdin.write('\nmute')
		}, 5000);*/
	});
};

function youtube(mediaUrl) {
	cp.exec('youtube-dl -g '+mediaUrl,function (error, stdout, stderr,stdin) {
   if (error) {
     console.log(error.stack);
     console.log('Error code: '+error.code);
     console.log('Signal received: '+error.signal);
   }

   if (stdout) {
/*   	console.log('---------------------------------------');
   	console.log('Child Process STDOUT:\n'+stdout+'\nEND');
   	console.log('---------------------------------------\n');*/
   		callback(stdout)
   };
 });
};

youtube(mediaUrl);

//console.log(youtube);
//cp.exec("sh -c 'mplayer -fs $(youtube-dl -g"+mediaUrl+")'", {}, function(err, stdout, stderr) {console.log('playback started');});
//cp.exec('mplayer -fs wpQRGRvs1TA.mp4');