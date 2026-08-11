const fs=require('fs');
const path=require('path');
const walk=d=>{let r=[];fs.readdirSync(d).forEach(f=>{let y=path.join(d,f);if(fs.statSync(y).isDirectory())r=r.concat(walk(y));else if(f.endsWith('.tsx'))r.push(y);});return r;};
walk('client/src/components').forEach(f=>{
    let c=fs.readFileSync(f,'utf8');
    let o=c;
    c=c.replace(/maxHeight: \\'85vh\\'/g, "maxHeight: '85vh'");
    if (o!==c) {
        fs.writeFileSync(f,c);
        console.log('Fixed', f);
    }
});
