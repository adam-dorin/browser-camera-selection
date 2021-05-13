const video = document.getElementById('video');
const button = document.getElementById('button');
const select = document.querySelector('div.container');
let currentStream;

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

function gotDevices(mediaDevices) {
  select.innerHTML = '';
  let count = 0;
  mediaDevices.forEach(mediaDevice => {
    console.log(count)
    if (mediaDevice.kind === 'videoinput') {
      count++;
      const button = document.createElement('button');
      button.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      button.appendChild(textNode);
      button.addEventListener('click',clickItem);
      if(count>1){
        button.classList.add('ml-1')
      }
      select.appendChild(button);
    }
  });
}
function clickItem(event) {
  console.log('click');
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream);
  }
  const videoConstraints = {};
  console.log(event.target.value);
  if (event.target.value === '') {
    videoConstraints.facingMode = 'environment';
  } else {
    videoConstraints.deviceId = { exact: event.target.value };
  }
  const constraints = {
    video: videoConstraints,
    audio: false
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
      console.log(stream,stream.getVideoTracks(),stream.getVideoTracks()[0].getCapabilities());
      
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    .catch(error => {
      console.error(error);
    });
}
button.addEventListener('click', clickItem );
navigator.mediaDevices.enumerateDevices().then(gotDevices);
