// const camera = document.getElementById('camera');
// const outfit = document.getElementById('outfit');

// async function startCamera() {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
//     camera.srcObject = stream;
//   } catch (error) {
//     console.error(error);
//     alert("Please allow camera access to try the outfit!");
//   }
// }

// // Wait for user interaction (needed on iPhones)
// document.body.addEventListener('click', () => {
//   startCamera();
//   document.querySelector('.instructions').textContent = "Align yourself with the outfit 👗";
// }, { once: true });

const cameraEl = document.getElementById('camera');
const outfit = document.getElementById('outfit');

// Start camera stream
const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
  cameraEl.srcObject = stream;
  return stream;
};

// Initialize MediaPipe Pose
const pose = new Pose.Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(onPoseResults);

function onPoseResults(results) {
  if (!results.poseLandmarks) {
    outfit.style.display = "none";
    return;
  }

  // Get key landmarks
  const leftShoulder = results.poseLandmarks[11];
  const rightShoulder = results.poseLandmarks[12];
  const leftHip = results.poseLandmarks[23];

  // Show outfit
  outfit.style.display = "block";

  // Compute size and position
  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  const bodyHeight = Math.abs(leftHip.y - leftShoulder.y);

  const outfitWidth = shoulderWidth * window.innerWidth * 3.5;
  const outfitHeight = bodyHeight * window.innerHeight * 3.2;

  outfit.style.width = `${outfitWidth}px`;
  outfit.style.height = `${outfitHeight}px`;

  outfit.style.left = `${leftShoulder.x * window.innerWidth}px`;
  outfit.style.top = `${leftShoulder.y * window.innerHeight}px`;
  outfit.style.transform = "translate(-50%, -10%)";
}

// Attach camera frames to pose
async function runPose() {
  const stream = await startCamera();
  const videoTrack = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(videoTrack);

  async function detect() {
    const bitmap = await imageCapture.grabFrame();
    await pose.send({ image: bitmap });
    requestAnimationFrame(detect);
  }
  detect();
}

document.body.addEventListener('click', () => {
  runPose();
  document.querySelector('.instructions').textContent = "Align yourself with the outfit 👗";
}, { once: true });



