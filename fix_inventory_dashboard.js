const fs = require('fs');

const file = 'frontend/stitch_vitalis_ai_health_dashboard/stitch_vitalis_ai_health_dashboard/medicine_inventory_ai_forecast/code.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the top right 4 buttons (notifications, help, settings, profile)
content = content.replace(
  /<div class="flex items-center gap-sm">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/header>/,
  `</div>
</div>
</header>`
);

// 2. Fix the fetch calls to use the live backend
content = content.replace(
  /const res = await fetch\('\/api\/inventory/g,
  "const res = await fetch('https://smart-health-sbqq.onrender.com/api/inventory"
);

// 3. Add pagination IDs to HTML
content = content.replace(
  /<span>Showing 1 to 5 of 1,402 entries<\/span>\s*<div class="flex gap-2">\s*<button[^>]*>Previous<\/button>\s*<button[^>]*>Next<\/button>\s*<\/div>/,
  `<span id="pagination-info">Showing 1 to 5 of 5 entries</span>
<div class="flex gap-2">
<button id="prev-page" onclick="prevPage()" class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors disabled:opacity-50" disabled="">Previous</button>
<button id="next-page" onclick="nextPage()" class="px-3 py-1 border border-outline-variant rounded hover:bg-surface-container-high transition-colors disabled:opacity-50">Next</button>
</div>`
);

// 4. Update JS for pagination
const paginationJS = `
let currentPage = 1;
const itemsPerPage = 5;

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderInventoryTable();
  }
}

function nextPage() {
  const query = document.getElementById('inventory-search').value.toLowerCase().trim();
  const filtered = inventoryData.filter(item => item.name.toLowerCase().includes(query));
  if (currentPage * itemsPerPage < filtered.length) {
    currentPage++;
    renderInventoryTable();
  }
}

function renderInventoryTable() {
  const query = document.getElementById('inventory-search').value.toLowerCase().trim();
  const tableBody = document.getElementById('inventory-table-body');
  tableBody.innerHTML = '';
  
  const filtered = inventoryData.filter(item => {
    return item.name.toLowerCase().includes(query);
  });

  const totalItems = filtered.length;
  const maxPage = Math.ceil(totalItems / itemsPerPage) || 1;
  if (currentPage > maxPage) currentPage = maxPage;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filtered.slice(startIndex, endIndex);

  document.getElementById('pagination-info').textContent = \`Showing \${totalItems === 0 ? 0 : startIndex + 1} to \${endIndex} of \${totalItems} entries\`;
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === maxPage;
  
  currentItems.forEach(item => {`;

content = content.replace(
  /function renderInventoryTable\(\) \{\s*const query = document.getElementById\('inventory-search'\).value.toLowerCase\(\).trim\(\);\s*const tableBody = document.getElementById\('inventory-table-body'\);\s*tableBody.innerHTML = '';\s*const filtered = inventoryData.filter\(item => \{\s*return item.name.toLowerCase\(\).includes\(query\);\s*\}\);\s*filtered.forEach\(item => \{/,
  paginationJS
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed medicine_inventory_ai_forecast');
