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
let detector;

async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      video.play();
      resolve();
    };
  });
}

async function initPoseDetection() {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
}

async function detectPose() {
  if (!detector) return;
  const poses = await detector.estimatePoses(video);

  if (poses.length > 0 && poses[0].keypoints) {
    const keypoints = poses[0].keypoints;

    // Get shoulders
    const leftShoulder = keypoints.find(k => k.name === "left_shoulder");
    const rightShoulder = keypoints.find(k => k.name === "right_shoulder");
    const nose = keypoints.find(k => k.name === "nose");

    if (leftShoulder && rightShoulder && leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
      const centerX = (leftShoulder.x + rightShoulder.x) / 2;
      const centerY = (leftShoulder.y + rightShoulder.y) / 2;

      // Position outfit at shoulder line
      outfit.style.left = `${centerX}px`;
      outfit.style.top = `${centerY}px`;

      // Adjust size based on shoulder width
      const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
      outfit.style.height = `${shoulderWidth * 4}px`;

      // Center it properly
      outfit.style.transform = "translate(-50%, -20%)";
    }
  }

  requestAnimationFrame(detectPose);
}

document.body.addEventListener('click', async () => {
  document.querySelector('.instructions').textContent = "Align yourself 👗";
  await initCamera();
  await initPoseDetection();
  detectPose();
}, { once: true });
