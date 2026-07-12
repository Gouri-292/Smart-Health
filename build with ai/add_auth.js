const fs = require('fs');
const path = require('path');
const targetDir = 'frontend/stitch_vitalis_ai_health_dashboard/stitch_vitalis_ai_health_dashboard';
const authScript = `
<script>
  if (!localStorage.getItem('user')) {
    window.location.href = '../login_healthgov_intelligence/code.html';
  }
</script>
`;

fs.readdirSync(targetDir).forEach(dir => {
  if (dir !== 'login_healthgov_intelligence') {
    const file = path.join(targetDir, dir, 'code.html');
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      if (!content.includes("localStorage.getItem('user')")) {
        content = content.replace('<head>', '<head>\n' + authScript);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Added auth check to ' + file);
      }
    }
  }
});
