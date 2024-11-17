const FORMATS = [
  { id: "jpeg", name: "JPEG", mime: "image/jpeg" },
  { id: "png", name: "PNG", mime: "image/png" },
  { id: "webp", name: "WebP", mime: "image/webp" },
];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DOWNLOAD_IMAGE") {
    chrome.downloads.download({
      url: message.imageUrl,
      filename: message.filename,
      saveAs: true,
    });
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "convertImage",
      title: "Convert and save image",
      contexts: ["image"],
    });

    FORMATS.forEach((format) => {
      chrome.contextMenus.create({
        id: `convert-to-${format.id}`,
        parentId: "convertImage",
        title: format.name,
        contexts: ["image"],
      });
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const formatId = info.menuItemId.replace("convert-to-", "");
  const format = FORMATS.find((f) => f.id === formatId);

  if (format) {
    chrome.tabs.sendMessage(tab.id, {
      type: "CONVERT_IMAGE",
      imageUrl: info.srcUrl,
      format: format,
    });
  }
});
