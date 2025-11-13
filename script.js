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


const camera = document.getElementById('camera');
const outfit = document.getElementById('outfit');

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    camera.srcObject = stream;
    console.log("✅ Camera started");
    startPoseTracking(); // start tracking once camera works
  } catch (error) {
    console.error(error);
    alert("Please allow camera access to try the outfit!");
  }
}

// Wait for user interaction (needed on iPhones)
document.body.addEventListener('click', () => {
  startCamera();
  document.querySelector('.instructions').textContent = "Align yourself with the outfit 👗";
}, { once: true });

// 🧠 NEW: Pose tracking for movement
function startPoseTracking() {
  const pose = new Pose.Pose({
    locateFile: (file) => https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  pose.onResults(onPoseResults);

  const cam = new Camera(camera, {
    onFrame: async () => {
      await pose.send({ image: camera });
    },
    width: 640,
    height: 480
  });
  cam.start();
}

function onPoseResults(results) {
  if (!results.poseLandmarks) return;

  const lm = results.poseLandmarks;
  const leftShoulder = lm[11];
  const rightShoulder = lm[12];
  const leftHip = lm[23];
  const rightHip = lm[24];

  // Calculate upper-body center and width
  const centerX = (leftShoulder.x + rightShoulder.x) / 2 * window.innerWidth;
  const centerY = (leftShoulder.y + rightShoulder.y) / 2 * window.innerHeight;
  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x) * window.innerWidth;
  const torsoHeight = Math.abs(((leftShoulder.y + rightShoulder.y) / 2) - ((leftHip.y + rightHip.y) / 2)) * window.innerHeight;

  // Move outfit smoothly with user
  outfit.style.left = ${centerX}px;
  outfit.style.top = ${centerY - torsoHeight * 0.4}px;
  outfit.style.transform = translate(-50%, 0) scale(${shoulderWidth / 200});
}
