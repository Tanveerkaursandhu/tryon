const camera = document.getElementById('camera');
const outfit = document.getElementById('outfit');

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    camera.srcObject = stream;
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
