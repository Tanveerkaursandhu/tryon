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

const videoElement = document.getElementById('camera');
const outfit = document.getElementById('outfit');
const instructions = document.querySelector('.instructions');

// Start only after user interaction (iPhone/iPad requirement)
document.body.addEventListener('click', () => {
  startTryOn();
  instructions.textContent = "Align your upper body with the outfit 👗";
}, { once: true });

async function startTryOn() {
  const pose = new Pose.Pose({
    locateFile: (file) => https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file},
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults(onPoseResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });
  camera.start();
}

function onPoseResults(results) {
  if (!results.poseLandmarks) return;

  const landmarks = results.poseLandmarks;
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  // Compute center of shoulders
  const centerX = (leftShoulder.x + rightShoulder.x) / 2 * window.innerWidth;
  const centerY = (leftShoulder.y + rightShoulder.y) / 2 * window.innerHeight;

  // Compute approximate torso height
  const torsoHeight = Math.abs(((leftShoulder.y + rightShoulder.y) / 2) - ((leftHip.y + rightHip.y) / 2)) * window.innerHeight;
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x) * window.innerWidth;

  // Position & scale the outfit image
  outfit.style.left = ${centerX}px;
  outfit.style.top = ${centerY - torsoHeight * 0.2}px; // slight upward offset
  outfit.style.transform = translate(-50%, 0) scale(${shoulderWidth / 200});
}
