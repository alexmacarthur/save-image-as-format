chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONVERT_IMAGE") {
    // convertImage(message.imageUrl, message.format);
  }
});
