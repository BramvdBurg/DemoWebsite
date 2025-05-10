const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const preview = document.getElementById("preview");
const countdown = document.getElementById("countdown");

let mediaRecorder;
let recordedChunks = [];
let timer;
let countdownInterval;
let recordingEnded = false;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    preview.srcObject = stream;

    console.log("Tracks:", stream.getTracks());
    console.log("Audio tracks:", stream.getAudioTracks());

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "recording.webm";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      lockScreen();
    };
  } catch (err) {
    console.error("Error accessing camera/mic:", err);
    alert("Could not access camera or microphone.");
  }
}

function lockScreen() {
  recordingEnded = true;
  startBtn.disabled = true;
  stopBtn.disabled = true;
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#000;color:#fff;flex-direction:column;text-align:center;">
      <h1>Opname Afgerond</h1>
      <p></p>
    </div>
  `;
}

function startCountdown(duration) {
  let timeLeft = duration;
  countdown.textContent = formatTime(timeLeft);
  countdownInterval = setInterval(() => {
    timeLeft--;
    countdown.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

startBtn.onclick = () => {
  if (recordingEnded) return;

  recordedChunks = [];
  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = true;

  startCountdown(120);

  timer = setTimeout(() => {
    if (mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  }, 2 * 60 * 1000); // 2 minutes
};

stopBtn.style.display = "none";

initCamera();
