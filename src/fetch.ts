import fs from 'fs';

async function run() {
  const res = await fetch('https://gamma-rosy.vercel.app/assets/index-CQUtFqv1.js');
  const text = await res.text();
  fs.writeFileSync('old_site.js', text);
}

run();
