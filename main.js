console.log(Tesseract ? '--- ready' : '--- not ready')

const OAUTH_PUBLIC_KEY = '';   // Your OAuth public key - oauth.io

// Constants
const FRAMES_CAM = 100   // apply filter every X ms, default = 100
const FRAMES_OCR = 400   // recognize text from image every Y ms, default = 400

const WIDTH = 640
const HEIGHT = 480
const CropHEIGHT = 120;

// const DIV = 6;
// const X = WIDTH/DIV, Y = HEIGHT/DIV, W = WIDTH - X*2, H = HEIGHT - Y*2;

// Code
var postBody = {
  'status': "Default Tweet, You didn't input anything!",
  'lat': 49.9028729,
  'long': 8.85785939,
}

let video, canvas, ctx, ctx2, ticks = 0, domResult, img1, i=0, coords, twitterOAuth

const constraints = {
  audio: false,
  video: true,
  advanced: [{
    facingMode: "environment"
  }]
}

const handleSuccess = (stream) => {
  console.log(' --- stream success');
  getGeolocation();
  setTwitter();

	domResult = document.querySelector('#ocr').firstChild;
  video = document.querySelector('#video')
  canvas = document.querySelector('#canvas')
  ctx = canvas.getContext('2d')
  canvas.width = WIDTH
  canvas.height = CropHEIGHT;

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

const setTwitter = () => {
  OAUTH_PUBLIC_KEY == '' ? alert('Missing Oauth Public Key in main.js') : OAuth.initialize(OAUTH_PUBLIC_KEY);
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
}

const getGeolocation = () => {
  if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          coords = position.coords;
          postBody.lat = coords.latitude;
          postBody.long = coords.longitude;
        });
    } else {
        console.log(" --- Geolocation is not supported by this browser.");
    }
}

const tick = () => {
  ticks++
  window.requestAnimationFrame(tick)
  if (ticks % FRAMES_CAM == 0){
    console.log("--- tick");
    //var myImage = new Image();
    //myImage.src = 'test1.jpg';
    //ctx.drawImage(myImage, 0, 0 , W, H, 0, 0, W, H);     // from Image File
    //ctx.drawImage(video, X, Y, W, H, 0, 0, W, H);        // from cropped size video

	  ctx.drawImage(video, 0, (HEIGHT - CropHEIGHT) / 2, WIDTH, CropHEIGHT, 0, 0, WIDTH, CropHEIGHT);
    filter();
  }
  if (ticks % FRAMES_OCR == 0) {
    recognize();
  }
}

const filter = (s) => {
    var imageData = ctx.getImageData(0, 0, WIDTH, CropHEIGHT);
    imageData = Filters.grayscale(imageData);
    imageData = Filters.filterImage(Filters.convolute, imageData,
      [  0, -1,  0,
        -1,  5, -1,
         0, -1,  0 ]
//         [-1, -1, -1,    // different kind of filter, the center of matrix can 9, 10, 11
//          -1,  9, -1,
//          -1, -1, -1]
    );

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
