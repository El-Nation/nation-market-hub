const fs = require('fs');
const wrapTable = (file, regex) => {
    let c = fs.readFileSync(file, 'utf8');
    let init = c;
    c = c.replace(regex, '<div className="responsive-table-wrapper" style={{ width: "100%", overflowX: "auto" }}>\n$1\n</div>');
    if (init !== c) {
        fs.writeFileSync(file, c);
        console.log('Wrapped table correctly in ' + file);
    }
};
wrapTable('client/src/components/AdminDashboard.tsx', /(<table[\s\S]*?<\/table>)/g);
wrapTable('client/src/components/ProviderDashboard.tsx', /(<table[\s\S]*?<\/table>)/g);
wrapTable('client/src/components/CustomerDashboard.tsx', /(<table[\s\S]*?<\/table>)/g);
