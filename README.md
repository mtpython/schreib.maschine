# SCHREIB.MASCHINE
The art-piece twitter: https://twitter.com/schreibmedien

An art-installation which allows you Tweet digital messages using an analog Typewriter. Uses HTML5 Video + Canvas, image convolutions, TesseractJS, http-server, vanilla JS.

Requirements: 
  - Node.js + local http-server (https://www.npmjs.com/package/http-server)
  - A good quality video/photo input (webcam, mobile phone as a webcam, local or external file) with enough light
  - OAuth (oauth.io) Public Key (requires a twitter app from twitter developer platform)
  
Use case: 
  - Add your OAuth Public Key to "main.js" - "OAUTH_PUBLIC_KEY"
  - Run "http-server" command from console in the repository folder locally
  - Go to "127.0.0.1:8080" in a browser (Google Chrome) 
  - Authorize your Twitter App 
  - Type on a typewriter or produce any other black-on-white text source
  - Align the image with a webcam so it's centered 
  - Adjust the slider until the text is clear without noise (compare with text on bottom of the page) 
  - 'p' to see the POST-request body in the console, 'P' (Shift+p) to post the Tweet to your connected twitter account
