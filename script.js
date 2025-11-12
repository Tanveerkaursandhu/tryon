
// Start camera
const camera = document.getElementById('camera');

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    camera.srcObject = stream;
  } catch (error) {
    alert("Camera access denied. Please allow camera to try outfit!");
  }
}

startCamera();

