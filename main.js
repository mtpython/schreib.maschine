console.log(Tesseract ? 'ready' : 'not ready')

// let img = new Image;
// img.src = "test.jpg";
// img.onload = function go() {
//   console.log('img loaded');
//
//   Tesseract.recognize(img, {
//     lang: 'deu',
//     //tessedit_char_blacklist: 'e'
// })
// .then(function(result){
//     console.log(result.text)
// })
// }


// Constants
const FRAMES_X = 70 // calculate every x frames

const WIDTH = 640
const HEIGHT = 480
const TIMEOUT = 500 // give time to load jsFeat

// Code


let video, canvas, ctx, ctx2, ticks = 0, domResult



const constraints = {
  audio: false,
  video: true,
  advanced: [{
    facingMode: "environment"
  }]
}

const handleSuccess = (stream) => {
  console.log(' --- stream success');
	domResult = document.querySelector('#ocr').firstChild;
  video = document.querySelector('#video')
  canvas = document.querySelector('#canvas')
  ctx = canvas.getContext('2d')
  canvas.width = WIDTH
  canvas.height = HEIGHT

  window.stream = stream; // make stream available to browser console
  video.srcObject = stream
  window.requestAnimationFrame(tick)
}

const tick = () => {
  ticks++
  window.requestAnimationFrame(tick)
  if (ticks % FRAMES_X !== 0) return
  console.log("tick")
  //ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //ctx.drawImage(video, 0, 0, 100, 300);
  //  drawImage(img/, sx,sy,swidth,sheight,x,y,width,height);
  ctx.drawImage(video, WIDTH/3, HEIGHT/3 , WIDTH/3, HEIGHT/3, 0, 0, WIDTH/3, HEIGHT/3);
  Tesseract.recognize(canvas, {
  	lang: 'deu',
    tessedit_char_blacklist: ',./|[{()}]\'\"!@#$%^&*-_=+;:`~`' ,
  }).then((result) => {
    //console.log(">RESULT", result.text)
    displayResult(result.text);
  })

}

const displayResult = text => {
	domResult.innerText = text
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
