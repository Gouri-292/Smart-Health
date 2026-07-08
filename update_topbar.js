const fs = require('fs');
const path = require('path');

const targetDir = 'frontend/stitch_vitalis_ai_health_dashboard/stitch_vitalis_ai_health_dashboard';
const dirs = ['district_dashboard', 'ai_health_predictions', 'city_phc_details', 'doctors_directory', 'medicine_inventory_ai_forecast'];

const topBarSearchRegex = /<div class="hidden sm:flex items-center bg-surface-container[^>]*>[\s\S]*?<input[^>]*placeholder="Search districts, metrics..."[^>]*>[\s\S]*?<\/div>/;

const topBarActionsRegex = /<div class="flex items-center gap-xs">([\s\S]*?)<div class="w-8 h-8 rounded-full ml-sm/;

const newSearchHtml = `
<div class="hidden sm:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant focus-within:border-primary transition-colors relative">
<span class="material-symbols-outlined text-outline mr-2 text-sm">search</span>
<input id="global-search" oninput="handleSearch(this.value)" class="bg-transparent border-none focus:ring-0 text-sm w-64 text-on-surface placeholder:text-outline p-0" placeholder="Search districts, metrics..." type="text"/>
<div id="search-results" class="absolute top-full left-0 mt-2 w-full bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg hidden z-50 max-h-64 overflow-y-auto"></div>
</div>
`;

const newActionsHtml = `
<div class="flex items-center gap-xs relative">
<button onclick="toggleNotifications()" class="p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors active:scale-95 duration-150 relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
</button>
<div id="notifications-dropdown" class="absolute top-full right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg hidden z-50 overflow-hidden">
  <div class="p-3 border-b border-outline-variant bg-surface-container-low font-title-sm text-on-surface font-bold">Notifications</div>
  <div id="notifications-list" class="max-h-64 overflow-y-auto"></div>
</div>
<div class="w-8 h-8 rounded-full ml-sm`;

const globalScript = `
<script>
  let searchTimeout;
  async function handleSearch(query) {
    const resultsDiv = document.getElementById('search-results');
    if (!query) {
      resultsDiv.classList.add('hidden');
      return;
    }
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch('https://smart-health-sbqq.onrender.com/api/hospitals/search?q=' + encodeURIComponent(query));
        const data = await res.json();
        if (data.length > 0) {
          resultsDiv.innerHTML = data.map(h => \`
            <div class="p-3 border-b border-outline-variant/30 hover:bg-surface-container-low cursor-pointer">
              <div class="font-bold text-sm">\${h.name}</div>
              <div class="text-xs text-on-surface-variant">\${h.type} • \${h.current_patients} patients</div>
            </div>
          \`).join('');
        } else {
          resultsDiv.innerHTML = '<div class="p-3 text-sm text-on-surface-variant">No results found</div>';
        }
        resultsDiv.classList.remove('hidden');
      } catch (err) {
        console.error(err);
      }
    }, 300);
  }

  async function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
      const list = document.getElementById('notifications-list');
      list.innerHTML = '<div class="p-3 text-sm text-center">Loading...</div>';
      try {
        const res = await fetch('https://smart-health-sbqq.onrender.com/api/notifications');
        const data = await res.json();
        list.innerHTML = data.map(n => \`
          <div class="p-3 border-b border-outline-variant/30 hover:bg-surface-container-low cursor-pointer">
            <div class="font-bold text-sm">\${n.title} <span class="text-xs text-on-surface-variant ml-2">\${n.time}</span></div>
            <div class="text-xs text-on-surface-variant mt-1">\${n.message}</div>
          </div>
        \`).join('');
      } catch (err) {
        list.innerHTML = '<div class="p-3 text-sm text-error">Failed to load</div>';
      }
    }
  }

  function downloadExport() {
    window.location.href = 'https://smart-health-sbqq.onrender.com/api/hospitals/export';
  }
</script>
`;

dirs.forEach(dir => {
  const filepath = path.join(targetDir, dir, 'code.html');
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Replace Search HTML
    content = content.replace(topBarSearchRegex, newSearchHtml);

    // Replace Actions HTML (removes Settings and Help, adds notifications dropdown)
    content = content.replace(topBarActionsRegex, newActionsHtml);

    // Replace Export Button (if exists)
    content = content.replace(/<button[^>]*>\s*<span[^>]*>download<\/span>\s*Export Report\s*<\/button>/g, 
        '<button onclick="downloadExport()" class="hidden sm:flex items-center gap-xs bg-surface-container px-4 py-2 border border-outline-variant rounded-lg text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors"><span class="material-symbols-outlined text-sm">download</span>Export Report</button>');

    // Inject JS
    if (!content.includes('handleSearch(query)')) {
      content = content.replace('</body>', globalScript + '\n</body>');
    }

    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Updated ' + dir);
  }
});
