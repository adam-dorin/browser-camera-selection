const video = document.getElementById('video');
const getCameraDevicesButton = document.getElementById('getCameraDevices');
const controlsContainer = document.querySelector('.controls .container');
let currentStream, currentCapabilities, currentSettings;

function stopMediaTracks(stream) {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

function getCurrentStreamCapabilities(){
  return currentStream.getVideoTracks()[0].getCapabilities()
}

function getCurrentStreamSettings(params) {
  return currentStream.getVideoTracks()[0].getSettings();
}

function createCameraButton(mediaDevice, count){
  return `
  <button 
  value="${mediaDevice.deviceId}"
  class="${ count < 1 ? 'camera': 'camera ml-1'}"
  >
  ${mediaDevice.label || 'Camera '+count}
  </button>
  `;
}

function gotDevices(mediaDevices) {
  let count = 0;
  let html = '';
  mediaDevices.forEach(mediaDevice => {
    if (mediaDevice.kind === 'videoinput') {
      html += createCameraButton(mediaDevice, count);
      count++;
    }
  });
  controlsContainer.innerHTML = html;
}
function getCameraDevices(event) {
 
  if (typeof currentStream !== 'undefined') {
    stopMediaTracks(currentStream);
  }

  let videoConstraints = {};
  if(event.target.value){
   videoConstraints.deviceId = { exact: event.target.value };
  } else {
    videoConstraints = true;
  }
  
  const constraints = {
    video: videoConstraints,
    audio: false
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      currentStream = stream;
      currentSettings = getCurrentStreamSettings();
      currentCapabilities = getCurrentStreamCapabilities();
      
      createControls(currentSettings, currentCapabilities);  
      
      video.srcObject = stream;
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    .catch(error => {
      console.error(error);
    });
}

function isObject(A) {
  return (typeof A === "object" || typeof A === 'function') && (A !== null) && A.length === undefined;
}

function createRange(label, settings, value) {

  return `
  <div class="element">
      <label for="#${label}">${label}<span> value:${value}</span></label>
     <input id="${label}"  
            value="${value}" 
            type="range" 
            min="${settings.min}" 
            max="${settings.max}" 
            step="${settings.step||1}" 
      />
  </div>
  `;
}

function createDropdown(label, settings, value) {

  let options = settings.map(setting=>`<option value="${setting}">${setting}</option>`).join(' ');
  return `
  <div class="element">
    <label for="#${label}">${label} <span> value:${value}</span></label>
    <select value=${value} id="${label}" >${options}</select>
  </div>
  `;
}

function createControls(settings, capabilities) {

  const capabilitiesKeys = Object.keys(capabilities);
  const capabilitiesDiv = document.querySelector('.capabilities');
  const controls = [];

  capabilitiesKeys.map( key => {
    
    if(isObject(capabilities[key]) ){
      let d_keys = Object.keys(capabilities[key]);
      if(d_keys.includes('min') && d_keys.includes('max') ){
        controls.push( createRange(key, capabilities[key], settings[key]) );
      }
    }

    if( Array.isArray(capabilities[key]) ) {
      controls.push( createDropdown(key, capabilities[key],settings[key]) );
    }
  });
  capabilitiesDiv.innerHTML = controls.join(' ');
  capabilitiesDiv.onchange = e =>{
    let track = currentStream.getVideoTracks()[0]
    let valSelector = `.capabilities label[for="#${e.target.getAttribute('id')}"] span`;
    let constraint = {};
    constraint[e.target.getAttribute('id')] = (+e.target.value||e.target.value);

    document.querySelector(valSelector).innerHTML = `
    value: ${(+e.target.value||e.target.value)}
    `;
    track.applyConstraints({ advanced : [constraint] });
  }
}
controlsContainer.addEventListener('click',e=>{
  if(e.target.classList.contains('camera')){
    getCameraDevices(e);
  }
})
getCameraDevicesButton.addEventListener('click', getCameraDevices);
navigator.mediaDevices.enumerateDevices().then(gotDevices);
