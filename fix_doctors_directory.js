const fs = require('fs');

const file = 'frontend/stitch_vitalis_ai_health_dashboard/stitch_vitalis_ai_health_dashboard/doctors_directory/code.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove search bar, notifications, and profile from the header
content = content.replace(
  /<div class="flex items-center gap-lg">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/header>/,
  `</div>
            </div>
        </header>`
);

// 2. Add onclick to Add Staff button
content = content.replace(
  /<button\s+class="hidden sm:flex items-center gap-xs bg-primary px-4 py-2 border border-transparent rounded-lg text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">\s*<span class="material-symbols-outlined text-sm">add<\/span>\s*Add Staff\s*<\/button>/g,
  `<button onclick="registerStaff()"
                    class="hidden sm:flex items-center gap-xs bg-primary px-4 py-2 border border-transparent rounded-lg text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
                    <span class="material-symbols-outlined text-sm">add</span>
                    Add Staff
                </button>`
);

// 3. Remove the more_horiz button
content = content.replace(
  /<button class="text-primary hover:bg-primary-container hover:text-on-primary-container p-2 rounded-full transition-colors">\s*<span class="material-symbols-outlined">more_horiz<\/span>\s*<\/button>/g,
  ''
);

// 4. Fix loadDoctors fetch URL for Render backend
content = content.replace(
  /const res = await fetch\('\/api\/doctors'\);/g,
  "const res = await fetch('https://smart-health-sbqq.onrender.com/api/doctors');"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed doctors_directory');
