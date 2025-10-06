const camera = document.getElementById("camera");
const preview = document.getElementById("preview");
const errorEl = document.getElementById("error");
const recordIndicator = document.getElementById("recordIndicator");
const timerEl = document.getElementById("timer");

let mediaStream;
let recorder;
let chunks = [];
let recordedURL = null;
let timerInterval;
let seconds = 0;

function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
}

async function initCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        camera.srcObject = mediaStream;
    } catch (e) {
        errorEl.textContent = "Camera access denied or not available.";
    }
}

function startRecording() {
    if (!mediaStream) return;
    chunks = [];
    recorder = new MediaRecorder(mediaStream);

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        if (recordedURL) URL.revokeObjectURL(recordedURL);
        recordedURL = URL.createObjectURL(blob);
        preview.src = recordedURL;
    };

    recorder.start();
    startTimer();
    recordIndicator.style.display = "flex";
}

function stopRecording() {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stopTimer();
    recordIndicator.style.display = "none";
}

async function shareRecording() {
    if (!recordedURL) return;
    const response = await fetch(recordedURL);
    const blob = await response.blob();
    const file = new File([blob], `clip_${Date.now()}.webm`, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "My clip" });
    } else {
        const a = document.createElement("a");
        a.href = recordedURL;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
}

function startTimer() {
    seconds = 0;
    timerEl.textContent = formatTime(seconds);
    timerInterval = setInterval(() => {
        seconds++;
        timerEl.textContent = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

document.getElementById("startBtn").onclick = startRecording;
document.getElementById("stopBtn").onclick = stopRecording;
document.getElementById("shareBtn").onclick = shareRecording;

async function initCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    camera.srcObject = mediaStream;

    camera.onloadedmetadata = () => {
      const aspectRatio = camera.videoWidth / camera.videoHeight;
      camera.style.width = "100%";
      camera.style.height = `${camera.offsetWidth / aspectRatio}px`;
    };
  } catch (e) {
    errorEl.textContent = "Camera access denied or not available.";
  }
}


initCamera();



