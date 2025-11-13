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

// Setup canvas for debugging
const canvas = document.createElement('canvas');
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "3";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Initialize Pose
const pose = new Pose.Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});

pose.onResults(onResults);

// Pose tracking callback
function onResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.poseLandmarks) {
    outfit.style.display = "none";
    ctx.fillStyle = "white";
    ctx.fillText("No pose detected", 20, 40);
    return;
  }

  // Draw body dots
  ctx.fillStyle = "cyan";
  results.poseLandmarks.forEach((lm) => {
    ctx.beginPath();
    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  // Get main joints
  const leftShoulder = results.poseLandmarks[11];
  const rightShoulder = results.poseLandmarks[12];
  const leftHip = results.poseLandmarks[23];

  outfit.style.display = "block";

  // Calculate size + position
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

// Manual camera feed loop (works on iOS)
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" }, // front camera
    });
    video.srcObject = stream;
    video.muted = true;          // ← new line
video.playsInline = true;    // ← new line
    await video.play();

    async function detectFrame() {
      await pose.send({ image: video });
      requestAnimationFrame(detectFrame);
    }
    detectFrame();
  } catch (err) {
    alert("Camera access is required to try the outfit!");
    console.error(err);
  }
}

document.body.addEventListener(
  "click",
  () => {
    startCamera();
    document.querySelector(".instructions").textContent =
      "Move to fit yourself in the outfit 👗";
  },
  { once: true }
);

