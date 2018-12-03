// {
//   "oauth_token": "1060488553304604672-Z1Pzt1hFGxGDW1WmQ2crSH2ATEmia6",
//   "oauth_token_secret": "M27VqkmlN5VqPOpBIk55fbhBNEpYzehamg8x1BiKGICha",
//   "provider": "twitter"
// }
// var twitter_application_consumer_key = 'PKPmK2v1MFiwMtHYQeWYDc8Xm';  // API Key
// var twitter_application_secret = 'CI4lzetMya2J87iowjHAwVWO4Up3cTdbhDLFNHo4PNB7y27jmP';  // API Secret
// var twitter_user_access_token = '1060488553304604672-Z1Pzt1hFGxGDW1WmQ2crSH2ATEmia6';  // Access Token
// var twitter_user_secret = 'M27VqkmlN5VqPOpBIk55fbhBNEpYzehamg8x1BiKGICha';  // Access Token Secret

console.log(Tesseract ? '--- ready' : '--- not ready')
OAuth.initialize('3JBEzStiurwZVNiGclBk1zlFrtA');

// Constants
const FRAMES_CAM = 100
const FRAMES_OCR = 400

const WIDTH = 640
const HEIGHT = 480
const CropHEIGHT = HEIGHT / 4;
const CropLENGTH = HEIGHT / 2;
const DIV = 6;
const X = WIDTH/DIV, Y = HEIGHT/DIV, W = WIDTH - X*2, H = HEIGHT - Y*2;
const TIMEOUT = 500; // give time to load jsFeat


// Code
var twitterOAuth;

var postBody = {
  'status': "Default Tweet, You didn't input anything!",
  'lat': 49.9028729,
  'long': 8.85785939,
}

// console.log('Ready to Tweet article:\n\t', postBody.status);
// oauth.post('https://api.twitter.com/1.1/statuses/update.json',
// 	twitter_user_access_token,  // oauth_token (user access token)
//     twitter_user_secret,  // oauth_secret (user secret)
//     postBody,  // post body
//     '',  // post content type ?
// 	function(err, data, res) {
// 		if (err) {
// 			console.log(err);
// 		} else {
// 			// console.log(data);
// 		}
// 	});

let video, canvas, ctx, ctx2, ticks = 0, domResult, flag = true, img1, i =0, coords

const constraints = {
  audio: false,
  video: true,
  advanced: [{
    facingMode: "environment"
  }]
}
//
const handleSuccess = (stream) => {
  console.log(' --- stream success');
  if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          coords = position.coords;
          postBody.lat = coords.latitude;
          postBody.long = coords.longitude;
        });
    } else {
        console.log(" --- Geolocation is not supported by this browser.");
    }
	domResult = document.querySelector('#ocr').firstChild;
  video = document.querySelector('#video')
  canvas = document.querySelector('#canvas')
  video.addEventListener("click", () =>  flag = !flag, false );
  // OAuth setup popup
  OAuth.popup('twitter').then(twitter => {
    console.log(twitter);
    twitterOAuth = twitter;
  })
  // Shift + P to post setup
  window.addEventListener("keydown", event => {
      if (event.key == 'p') console.log(postBody);
      if (event.key == "P") {
        twitterOAuth.post({
            //url: "/1.1/statuses/update.json?status=" + encodeURI(postBody)
            url: "/1.1/statuses/update.json",
            data: postBody,
          }).then(tweet => console.log('Posted tweet: "' + tweet.text + '"!'))
            .fail(err => console.log("Error: " + JSON.parse(err.responseText).errors[0].message));
      }});
  ctx = canvas.getContext('2d')
  canvas.width = WIDTH
  canvas.height = 120;

  window.stream = stream; // make stream available to browser console
  video.srcObject = stream
  window.requestAnimationFrame(tick)
}

const recognize = () => {
  Tesseract.recognize(canvas, {
  	lang: 'deu',
    tessedit_char_whitelist: 'QWERTYUIOPASDFGHJKLZXCVBNM,.qwertyuiopasdfghjklzxcvbnmÄäÖöÜüß?!:)' ,
  }).then((result) => {
    //console.log(">RESULT", result.text)
    postBody.status = result.text;
    domResult.innerText = result.text;
  })
}

const tick = () => {
  ticks++
  window.requestAnimationFrame(tick)
  if (ticks % FRAMES_CAM == 0){
    console.log("--- tick");
    //var myImage = new Image();
    //myImage.src = 'test1.jpg';
    //ctx.drawImage(myImage, 0, 0 , W, H, 0, 0, W, H);
    //ctx.drawImage(video, X, Y, W, H, 0, 0, W, H);
    
	ctx.drawImage(video, 0, CropHEIGHT, WIDTH, CropHEIGHT, 0, 0, WIDTH, CropHEIGHT);
      filter();
  }
  if (ticks % FRAMES_OCR == 0) {
    
    recognize();
  }
}

const filter = (s) => {
    var imageData = ctx.getImageData(0, 0, WIDTH, CropHEIGHT);
    if (flag){
      imageData = Filters.grayscale(imageData);
      imageData = Filters.filterImage(Filters.convolute, imageData,
        [  0, -1,  0,
          -1,  5, -1,
           0, -1,  0 ]
//         [-1, -1, -1,
//          -1,  9, -1,
//          -1, -1, -1]
    );
  } else imageData = Filters.grayscale(imageData);


    if (document.querySelector("#range1").innerText !== document.querySelector("#threshold").value)
      document.querySelector("#range1").innerText = document.querySelector("#threshold").value;
    Filters.threshold(imageData, document.querySelector("#threshold").value);
    ctx.putImageData(imageData, 0, 0);
}

const handleError = (error) => {
  console.log('navigator.getUserMedia error: ', error);
}

window.Tesseract = Tesseract.create({
    langPath: 'https://cdn.rawgit.com/naptha/tessdata/gh-pages/3.02/',
    corePath: 'https://cdn.rawgit.com/naptha/tesseract.js-core/0.1.0/index.js',
})

navigator.mediaDevices
  .getUserMedia(constraints)
  .then(handleSuccess)
  .catch(handleError)
