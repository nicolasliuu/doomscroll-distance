// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const totalValue = document.getElementById('total-value');
    const siteList = document.getElementById('site-list');
    const explanation = document.getElementById('fun-fact');
    const resetTotalBtn = document.getElementById('reset-total');
    const resetSitesBtn = document.getElementById('reset-sites');
    const exportDataBtn = document.getElementById('export-data');
    const importFileInput = document.getElementById('import-file');
    const importDataBtn = document.getElementById('import-data');
    const progressBar = document.getElementById('progress-bar');
  
    const MILESTONES = [1000, 5000, 10000, 20000, 50000]; // Realistic scroll milestones in pixels
    let reachedMilestones = [];
  
    const PRESETS = [
      { threshold: 1000, message: 'You have scrolled 1,000px!' },
      { threshold: 5000, message: '5,000px! Keep going!' },
      { threshold: 10000, message: '10,000px! Impressive scrolling!' },
      { threshold: 20000, message: '20,000px! You must be a pro!' },
      { threshold: 50000, message: '50,000px! Wow, incredible!' }
    ];
  
    function formatNumber(num) {
      return num.toLocaleString();
    }
  
    function getFunFact(pixels) {
      for (let preset of PRESETS) {
        if (pixels < preset.threshold) {
          return preset.message;
        }
      }
      return 'Keep scrolling for more achievements!';
    }
  
    function updateProgressBar(pixels) {
      const maxThreshold = MILESTONES[MILESTONES.length - 1];
      const percentage = Math.min((pixels / maxThreshold) * 100, 100);
      progressBar.style.width = `${percentage}%`;
    }
  
    function updateUI() {
      chrome.storage.local.get(['scrollData', 'totalScroll', 'screenHeights'], (result) => {
        console.log("Popup received storage data:", result);
        const totalPixels = result.totalScroll || 0;
        const scrollData = result.scrollData || {};
        const screenHeights = result.screenHeights || {};
  
        // Calculate screenfuls
        let totalScreenfuls = 0;
        Object.entries(scrollData).forEach(([url, scroll]) => {
          const screenHeight = screenHeights[url] || 1000; // Default to 1000px if undefined
          totalScreenfuls += scroll / screenHeight;
        });
  
        const totalInches = totalPixels / 96;
        const totalFeet = totalInches / 12;
        const totalMeters = totalInches * 0.0254;
        const totalMiles = totalFeet / 5280;
  
        totalValue.textContent = `${formatNumber(totalPixels)} px / ${formatNumber(totalInches.toFixed(2))} in / ${formatNumber(totalFeet.toFixed(2))} ft / ${formatNumber(totalMeters.toFixed(2))} m / ${formatNumber(totalMiles.toFixed(2))} mi / ${formatNumber(totalScreenfuls.toFixed(2))} screenfuls`;
  
        explanation.textContent = getFunFact(totalPixels);
  
        updateProgressBar(totalPixels);
  
        siteList.innerHTML = '';
        Object.entries(scrollData).forEach(([url, scroll]) => {
          const screenHeight = screenHeights[url] || 1000; // Default to 1000px
          const screenfuls = (scroll / screenHeight).toFixed(2);
          const li = document.createElement('li');
          li.innerHTML = `<span>${url}</span><span>${formatNumber(scroll)} px (${screenfuls} screenfuls)</span>`;
          siteList.appendChild(li);
        });
  
        // Check and trigger milestones if already passed
        MILESTONES.forEach(milestone => {
          if (totalPixels >= milestone && !reachedMilestones.includes(milestone)) {
            reachedMilestones.push(milestone);
            // Optionally, you can display a message or visual indicator here
            console.log(`Milestone reached: ${milestone}px`);
          }
        });
      });
    }
  
    function exportData() {
      chrome.storage.local.get(['scrollData', 'totalScroll'], (result) => {
        console.log("Exporting data:", result);
        const dataStr = JSON.stringify(result, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'doomscroll_distance_data.json';
        a.click();
        URL.revokeObjectURL(url);
        console.log("Data exported successfully");
      });
    }
  
    function importData(file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          console.log("Imported data:", data);
          chrome.storage.local.set(data, () => {
            reachedMilestones = []; // Reset milestones
            updateUI();
            alert('Data imported successfully!');
          });
        } catch (error) {
          alert('Invalid JSON file.');
          console.error('Import Error:', error);
        }
      };
      reader.readAsText(file);
    }
  
    // Update UI initially
    updateUI();
  
    // Listen for changes in storage to update UI dynamically
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        console.log("Storage changes detected:", changes);
        updateUI();
      }
    });
  
    // Reset Total Scroll
    resetTotalBtn.addEventListener('click', () => {
      chrome.storage.local.set({ totalScroll: 0 }, () => {
        alert('Total scroll distance has been reset.');
        reachedMilestones = [];
        updateUI();
      });
    });
  
    // Reset Site Scroll Data
    resetSitesBtn.addEventListener('click', () => {
      chrome.storage.local.set({ scrollData: {} }, () => {
        alert('Per-site scroll data has been reset.');
        updateUI();
      });
    });
  
    // Export Data
    exportDataBtn.addEventListener('click', exportData);
  
    // Import Data
    importDataBtn.addEventListener('click', () => {
      importFileInput.click();
    });
  
    importFileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) importData(file);
      // Reset the input value to allow importing the same file again if needed
      event.target.value = '';
    });
  });
  