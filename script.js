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

const cameraElement = document.getElementById('camera');
const outfit = document.getElementById('outfit');

// Create a canvas overlay to visualize landmarks
const canvas = document.createElement('canvas');
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "3";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Setup MediaPipe Pose
const pose = new Pose.Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

pose.onResults(onResults);

function onResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.poseLandmarks) {
    outfit.style.display = "none";
    ctx.fillStyle = "white";
    ctx.fillText("No pose detected", 30, 30);
    return;
  }

  // Draw dots to check tracking
  ctx.fillStyle = "cyan";
  results.poseLandmarks.forEach((lm) => {
    ctx.beginPath();
    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Get key landmarks
  const leftShoulder = results.poseLandmarks[11];
  const rightShoulder = results.poseLandmarks[12];
  const leftHip = results.poseLandmarks[23];

  // Show outfit
  outfit.style.display = "block";

  // Compute size and position
  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  const bodyHeight = Math.abs(leftHip.y - leftShoulder.y);
  const outfitWidth = shoulderWidth * window.innerWidth * 3.2;
  const outfitHeight = bodyHeight * window.innerHeight * 3.5;

  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  const topY = leftShoulder.y - 0.1;

  outfit.style.width = `${outfitWidth}px`;
  outfit.style.height = `${outfitHeight}px`;
  outfit.style.left = `${centerX * window.innerWidth}px`;
  outfit.style.top = `${topY * window.innerHeight}px`;
  outfit.style.transform = "translate(-50%, 0)";
}

// Start camera using MediaPipe helper
async function startPoseCamera() {
  const camera = new CameraUtils.Camera(cameraElement, {
    onFrame: async () => {
      await pose.send({ image: cameraElement });
    },
    width: 1280,
    height: 720,
  });
  camera.start();
}

document.body.addEventListener('click', () => {
  startPoseCamera();
  document.querySelector('.instructions').textContent = "Align yourself with the outfit 👗";
}, { once: true });

