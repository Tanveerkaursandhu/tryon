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

let camera;

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
  if (!results.poseLandmarks) {
    outfit.style.display = "none";
    return;
  }

  // Get key landmarks
  const leftShoulder = results.poseLandmarks[11];
  const rightShoulder = results.poseLandmarks[12];
  const leftHip = results.poseLandmarks[23];

  // Show the outfit
  outfit.style.display = "block";

  // Calculate approximate outfit size and position
  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  const bodyHeight = Math.abs(leftHip.y - leftShoulder.y);

  const outfitWidth = shoulderWidth * window.innerWidth * 3.2;
  const outfitHeight = bodyHeight * window.innerHeight * 3.5;

  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  const topY = leftShoulder.y - 0.1; // shift a bit upward

  outfit.style.width = `${outfitWidth}px`;
  outfit.style.height = `${outfitHeight}px`;

  outfit.style.left = `${centerX * window.innerWidth}px`;
  outfit.style.top = `${topY * window.innerHeight}px`;
  outfit.style.transform = "translate(-50%, 0)";
}

// Start camera feed using MediaPipe helper
async function startPoseCamera() {
  camera = new CameraUtils.Camera(cameraElement, {
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
  document.querySelector('.instructions').textContent = "Move to fit the outfit 👗";
}, { once: true });
