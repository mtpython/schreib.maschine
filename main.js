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
const FRAMES_OCR = 1000

const WIDTH = 640
const HEIGHT = 480
const DIV = 6;
const X = WIDTH/DIV, Y = HEIGHT/DIV, W = WIDTH - X*2, H = HEIGHT - Y*2;
const TIMEOUT = 500; // give time to load jsFeat


// Code
var twitterOAuth;

var postBody = "Default Tweet, You didn't input anything!"

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

let video, canvas, ctx, ctx2, ticks = 0, domResult, flag = true, img1, i =0

// var provider = 'facebook';
//
// OAuth.popup(provider)
// .done(function(result) {
//     result.me()
//     .done(function (response) {
//         console.log('Firstname: ', response.firstname);
//         console.log('Lastname: ', response.lastname);
//     })
//     .fail(function (err) {
//         //handle error with err
//     });
// })
// .fail(function (err) {
//     //handle error with err
// });



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
            url: "/1.1/statuses/update.json?status=" + encodeURI(postBody)
          }).then(tweet => console.log('Posted tweet: "' + tweet.text + '"!'))
            .fail(err => console.log("Error: " + JSON.parse(err.responseText).errors[0].message));
      }});
  ctx = canvas.getContext('2d')
  canvas.width = W
  canvas.height = H

  window.stream = stream; // make stream available to browser console
  video.srcObject = stream
  window.requestAnimationFrame(tick)
}

const recognize = () => {
  Tesseract.recognize(canvas, {
  	lang: 'deu',
    tessedit_char_whitelist: 'QWERTYUIOPASDFGHJKLZXCVBNM,.qwertyuiopasdfghjklzxcvbnmÄäÖöÜüß?!-+\'1234567890' ,
  }).then((result) => {
    //console.log(">RESULT", result.text)
    postBody = result.text;
  })
}

const tick = () => {
  ticks++
  window.requestAnimationFrame(tick)
  if (ticks % FRAMES_CAM == 0){
    console.log("--- tick");
    var myImage = new Image();
    myImage.src = 'test1.jpg';
    ctx.drawImage(myImage, 0, 0 , W, H, 0, 0, W, H);
    //ctx.drawImage(video, X, Y, W, H, 0, 0, W, H);
  }
  if (ticks % FRAMES_OCR == 0) {
    filter();
    recognize();
  }
}

const filter = (s) => {
    var imageData = ctx.getImageData(0, 0, W, H);
    if (flag){
      //imageData = Filters.grayscale(imageData);
      imageData = Filters.filterImage(Filters.convolute, imageData,
        [  0, -1,  0,
          -1,  5, -1,
           0, -1,  0 ]
        // [-1, -1, -1,
        //  -1,  document.querySelector("#sharpness").value, -1,
        //  -1, -1, -1]
    );
  } else imageData = Filters.grayscale(imageData);


    if (document.querySelector("#range1").innerText !== document.querySelector("#threshold").value)
      document.querySelector("#range1").innerText = document.querySelector("#threshold").value;
    if (document.querySelector("#range2").innerText !== document.querySelector("#sharpness").value)
      document.querySelector("#range2").innerText = document.querySelector("#sharpness").value;
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
