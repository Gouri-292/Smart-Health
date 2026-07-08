const fs = require('fs');

const file = 'frontend/stitch_vitalis_ai_health_dashboard/stitch_vitalis_ai_health_dashboard/city_phc_details/code.html';
let content = fs.readFileSync(file, 'utf8');

// Remove View Map and Edit Details buttons
content = content.replace(
  /<div class="flex gap-md">\s*<button class="px-md py-sm rounded-lg border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex items-center gap-xs">\s*<span class="material-symbols-outlined text-\[18px\]">map<\/span> View Map\s*<\/button>\s*<button class="px-md py-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm flex items-center gap-xs">\s*<span class="material-symbols-outlined text-\[18px\]">edit<\/span> Edit Details\s*<\/button>\s*<\/div>/g,
  ''
);

// Remove the three dots (more_vert)
content = content.replace(
  /<span class="material-symbols-outlined text-outline hover:text-on-surface cursor-pointer">more_vert<\/span>/g,
  ''
);

// Fix the undefined initial
content = content.replace(
  /\$\{member\.initial\}/g,
  "${(member.name || '').replace('Dr. ', '').charAt(0) || 'D'}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed city_phc_details');
