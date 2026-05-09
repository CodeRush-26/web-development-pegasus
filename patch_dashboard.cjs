const fs = require('fs');
const path = 'd:\\Work\\Vs Code\\competetion\\coderush26\\client\\src\\Pages\\UserDashboard\\UserDashBoard.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCode = `    // If Admin, add Playback View
    if (user?.role === "admin") {
      links.splice(1, 0, {
        title: "Historical Playback",
        icon: History,
        path: "/dashboard/playback",
        exact: true,
      });
    }`;

const newCode = `    // If Admin, remove Profile and add Playback View
    if (user?.role === "admin") {
      links = links.filter(l => l.title !== "Profile");
      links.splice(1, 0, {
        title: "Historical Playback",
        icon: History,
        path: "/dashboard/playback",
        exact: true,
      });
    }`;

// Normalize line endings for comparison
const normalizedOld = oldCode.replace(/\r\n/g, '\n');
const normalizedContent = content.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedOld)) {
  const updatedContent = normalizedContent.replace(normalizedOld, newCode.replace(/\r\n/g, '\n'));
  fs.writeFileSync(path, updatedContent);
  console.log('Successfully updated');
} else {
  console.log('Target not found');
  console.log('Normalized Content Segment:', JSON.stringify(normalizedContent.slice(normalizedContent.indexOf('// If Admin'), normalizedContent.indexOf('return links'))));
}
