const fs = require('fs');
const file = 'frontend/stitch_vitalis_ai_health_dashboard/stitch_vitalis_ai_health_dashboard/doctors_directory/code.html';
let content = fs.readFileSync(file, 'utf8');

// Replace Add Staff button to add onclick
content = content.replace(
  '<button\n                    class="hidden sm:flex items-center',
  '<button onclick="registerStaff()"\n                    class="hidden sm:flex items-center'
);

const regStaff = `
        async function registerStaff() {
            const name = prompt("Enter doctor's full name:");
            if (!name) return;
            const specialization = prompt("Enter specialization:");
            if (!specialization) return;

            try {
                const res = await fetch('https://smart-health-sbqq.onrender.com/api/doctors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, specialization })
                });
                if (res.ok) {
                    loadDoctors();
                }
            } catch (error) {
                console.error("Error adding staff:", error);
            }
        }
`;

if (!content.includes('function registerStaff')) {
    content = content.replace('async function loadDoctors() {', regStaff + '\n        async function loadDoctors() {');
}

fs.writeFileSync(file, content);

// Also fix the Add Patient button in city_phc_details
const file2 = 'frontend/stitch_vitalis_ai_health_dashboard/stitch_vitalis_ai_health_dashboard/city_phc_details/code.html';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace("fetch('/api/phc/1/queue'", "fetch('https://smart-health-sbqq.onrender.com/api/phc/1/queue'");
fs.writeFileSync(file2, content2);
