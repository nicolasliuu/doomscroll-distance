// background.js

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SCROLL_DATA") {
      console.log("Background received SCROLL_DATA:", message.data);
      const { url, scrollDelta, screenHeight } = message.data;
      storeScrollData(url, scrollDelta, screenHeight);
      sendResponse({ status: "success" });
    }
  });
  
  // Function to store scroll data using chrome.storage.local
  function storeScrollData(url, scrollDelta, screenHeight) {
    chrome.storage.local.get(['scrollData', 'totalScroll', 'screenHeights'], (result) => {
      let scrollData = result.scrollData || {};
      let totalScroll = result.totalScroll || 0;
      let screenHeights = result.screenHeights || {};
  
      // Update per-site scroll
      if (scrollData[url]) {
        scrollData[url] += scrollDelta;
      } else {
        scrollData[url] = scrollDelta;
      }
  
      // Update total scroll
      totalScroll += scrollDelta;
  
      // Store screen height
      if (screenHeights[url]) {
        // Optionally, you can average or keep track of multiple screen heights
        screenHeights[url] = screenHeight; // Keeping the latest
      } else {
        screenHeights[url] = screenHeight;
      }
  
      // Save updated data back to storage
      chrome.storage.local.set({
        scrollData: scrollData,
        totalScroll: totalScroll,
        screenHeights: screenHeights
      }, () => {
        console.log(`Stored ${scrollDelta}px for ${url}, total: ${totalScroll}px`);
      });
    });
  }
  