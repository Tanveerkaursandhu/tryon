
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

const video = document.getElementById('camera');
const outfit = document.getElementById('outfit');
const instructions = document.querySelector('.instructions');

// Start the webcam
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    instructions.textContent = "Align yourself with the outfit 👗";
    startPoseDetection();
  } catch (error) {
    alert("Please allow camera access to try the outfit!");
  }
}

// Wait for click (for iPhone compatibility)
document.body.addEventListener('click', startCamera, { once: true });

// Pose detection using Mediapipe
function startPoseDetection() {
  const pose = new Pose({
    locateFile: (file) => https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults((results) => {
    if (results.poseLandmarks) {
      const leftShoulder = results.poseLandmarks[11];
      const rightShoulder = results.poseLandmarks[12];
      const leftHip = results.poseLandmarks[23];
      const rightHip = results.poseLandmarks[24];

      const shoulderX = (leftShoulder.x + rightShoulder.x) / 2;
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipY = (leftHip.y + rightHip.y) / 2;

      const videoRect = video.getBoundingClientRect();
      const outfitHeight = (hipY - shoulderY) * videoRect.height * 2.2;
      const outfitTop = shoulderY * videoRect.height;
      const outfitLeft = shoulderX * videoRect.width;

      outfit.style.top = ${outfitTop}px;
      outfit.style.left = ${outfitLeft}px;
      outfit.style.height = ${outfitHeight}px;
      outfit.style.transform = "translate(-50%, 0)";
    }
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      await pose.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start();
}
