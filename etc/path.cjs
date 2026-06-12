const path = require('path');
console.log('Current file:', __filename);
console.log('Current directory:', __dirname);
console.log('Separator', path.sep);
// console.log('Path parts:', path.parse(__filename));
// console.log('Base name:', path.basename(__filename));
// console.log('Directory name:', path.dirname(__filename));
// console.log('Extension name:', path.extname(__filename));

const projectDir = path.join(__dirname, '..');
console.log('Project directory:', projectDir);

const groupDir = path.resolve(__dirname, '..');
console.log('Group directory:', groupDir);

const config = path.join(projectDir, '/package.json');
console.log('Config path:', config);
const config2 = path.resolve(projectDir, 'package.json');
console.log('Config path 2:', config2);

console.log('Config path parse:', path.parse(config));
console.log('Config path base:', path.basename(config));
console.log('Config path dir:', path.dirname(config));
console.log('Config path ext:', path.extname(config));

const any_URL = 'https://tel-ran.zoom.us/rec/play/-5RU3N8uOdYr9Us26y5JmDmh7EhfgrIC52evom2Gv3Am7g4C-9AGKF7pT6IyXt5LWqOeYHQc27VzHMQ.UKyvRZohjFKW9Ni0?accessLevel=meeting&canPlayFromShare=true&from=share_recording_detail&continueMode=true&oldStyle=true&componentName=rec-play&originRequestUrl=https%3A%2F%2Ftel-ran.zoom.us%2Frec%2Fshare%2FGCLFQHQvQGewrlADjtKG5wtQKBy9nfQ50fsw-k_5VOKAeFWRs_GTOmjjBTgu26J_.guQp68aqYTEfVsne';
const parsedURL = new URL(any_URL);
console.log('Parsed URL:', parsedURL);