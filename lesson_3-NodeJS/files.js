import fs from 'node:fs';
// fs.stat('lorem.txt', (err, stats) => {
//   if (err) {
//     console.error(err);
//   }
//   else {
//     console.log(stats);
//     console.log('Is file:', stats.isFile());
//     console.log('Is directory:', stats.isDirectory());
//   }
// });

fs.writeFile('lorem.txt', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', (err) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log('File created successfully.');
    }
});



fs.appendFile('lorem.txt', '\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', (err) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log('Content appended successfully.');
    }
});

fs.rename('lorem.txt', 'lorem_updated.txt', (err) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log('File renamed successfully.');
    }
});

fs.readFile('lorem_updated.txt', 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log('File content:', data);
    }
});

