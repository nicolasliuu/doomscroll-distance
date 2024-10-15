// content.js

// Guard to prevent multiple executions
if (window.hasDoomscrollDistance) {
    console.log("DoomscrollDistance content script already running.");
  } else {
    window.hasDoomscrollDistance = true;
  
    let totalScrolledPixels = 0;
    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
    // Throttle utility to limit function execution
    function throttle(func, limit) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    }
  
    // Function to send scroll data to the background script
    function sendScrollData(scrollDeltaPixels) {
      console.log(`Sending scroll data: ${scrollDeltaPixels}px`);
      const screenHeight = window.innerHeight || document.documentElement.clientHeight || 1000; // Default to 1000px if undefined
  
      chrome.runtime.sendMessage({
        type: "SCROLL_DATA",
        data: {
          url: window.location.origin,
          scrollDelta: scrollDeltaPixels,
          screenHeight: screenHeight
        },
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
        } else {
          console.log("Scroll data sent successfully:", response.status);
        }
      });
    }
  
    // Function to handle scroll events
    function handleScroll() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDelta = Math.abs(currentScrollTop - lastScrollTop);
      totalScrolledPixels += scrollDelta;
      lastScrollTop = currentScrollTop;
  
      console.log(`Scroll Delta: ${scrollDelta}px, Total: ${totalScrolledPixels}px`);
  
      // Define your threshold here (e.g., 1000px)
      const SCROLL_THRESHOLD = 1000;
  
      if (totalScrolledPixels >= SCROLL_THRESHOLD) {
        sendScrollData(totalScrolledPixels);
        totalScrolledPixels = 0; // Reset after sending data
      }
    }
  
    // Throttled scroll handler to improve performance
    const throttledHandleScroll = throttle(handleScroll, 200);
  
    // Attach the scroll listener to the window
    window.addEventListener("scroll", throttledHandleScroll);
    console.log("Attached scroll listener to window");
  
    // Optional: Clean up the listener when the page is unloaded
    window.addEventListener("beforeunload", () => {
      window.removeEventListener("scroll", throttledHandleScroll);
      console.log("Removed scroll listener from window");
    });
  }
  