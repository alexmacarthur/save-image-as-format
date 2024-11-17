async function convertImage(imageUrl, format) {
  showNotification("Hold up, converting the image...");

  try {
    const formData = new FormData();
    const urlObject = new URL(imageUrl);
    const extension = urlObject.pathname.split(".").pop() || "unknown";

    formData.set("url", imageUrl);
    formData.set("format", format);
    formData.set("originalFormat", extension);

    const response = await fetch(`https://go.picperf.io/api/convert`, {
      method: "POST",
      body: formData,
    });

    const imageBuffer = await response.arrayBuffer();
    downloadImage(imageBuffer, format);
  } catch (error) {
    console.error(error);

    showNotification("Something went wrong with the conversion... sorry!");
  }
}

function downloadImage(imageBuffer, format) {
  const blob = new Blob([imageBuffer], { type: `image/${format}` });
  const blobUrl = URL.createObjectURL(blob);

  chrome.runtime.sendMessage({
    type: "DOWNLOAD_IMAGE",
    imageUrl: blobUrl,
    filename: `converted-image.${format}`,
  });

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

function showNotification(message) {
  const existingNotification = document.querySelector(".pp-notification");

  if (existingNotification) {
    clearTimeout(window.ppTimeout);
    existingNotification.remove();
  }

  const notification = document.createElement("div");
  notification.classList.add("pp-notification");

  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&display=swap');

    .pp-notification {
        position: fixed;
        padding: 16px 24px;
        color: #1f2937;
        border-radius: 5px;
        z-index: 10000;
        font-family: "Karla", sans-serif;
        box-shadow: 0 2px 3px rgba(0,0,0,0.2);
        bottom: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        gap: 8px;
    }

    .pp-logo {
        height: 25px; 
        width: 25px;
    }
    `;
  document.head.appendChild(styleTag);

  const logo = `<svg style="max-width: 100%; max-height: 100%;" width="102" height="128" viewBox="0 0 102 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M55.4072 0.184947C56.8255 0.682988 57.7212 2.08404 57.5781 3.58035L53.0559 50.85L98.0524 43.0855C99.3351 42.8642 100.627 43.4249 101.341 44.5131C102.055 45.6013 102.056 47.0095 101.342 48.0982L50.2869 126.016C49.4631 127.273 47.888 127.807 46.4698 127.309C45.0515 126.811 44.1558 125.41 44.2989 123.913L48.8211 76.6437L3.82459 84.4082C2.54194 84.6295 1.25021 84.0688 0.536013 82.9806C-0.17818 81.8924 -0.178711 80.4842 0.534661 79.3955L51.5901 1.47756C52.4139 0.22028 53.989 -0.313094 55.4072 0.184947ZM10.1255 76.6868L51.9267 69.4737C52.9306 69.3004 53.958 69.6052 54.705 70.2979C55.4521 70.9906 55.8335 71.992 55.7364 73.0061L52.066 111.373L91.7515 50.8069L49.9503 58.02C48.9464 58.1933 47.919 57.8885 47.172 57.1958C46.4249 56.5032 46.0435 55.5018 46.1406 54.4876L49.811 16.121L10.1255 76.6868Z" fill="url(#paint0_linear_113_4)"/>
    <defs>
    <linearGradient id="paint0_linear_113_4" x1="31.036" y1="-2.90708" x2="345.816" y2="481.37" gradientUnits="userSpaceOnUse">
    <stop stop-color="#1F2937"/>
    <stop offset="0.0001" stop-color="#0369A1"/>
    <stop offset="1" stop-color="#0EA5E9" stop-opacity="0"/>
    </linearGradient>
    </defs>
    </svg>
`;

  notification.innerHTML = `
    <div class="pp-logo">${logo}</div>
    <span>${message}</span>
  `;
  document.body.appendChild(notification);

  window.ppTimeout = setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.5s ease";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notification.remove();
      });
    });
  }, 3000);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CONVERT_IMAGE") {
    convertImage(message.imageUrl, message.format.id);
    return true;
  }
});
