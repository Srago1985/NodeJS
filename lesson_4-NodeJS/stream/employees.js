import fs from 'node:fs';
import {differenceInYears} from "date-fns";
import readline from 'node:readline';




const stream = fs.createReadStream('./stream/employees.csv', 'utf-8');

 
 let salary = 0;
 let age = 0;
 let count = 0;



const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
});

rl.on('line', line => {
    const cells = line.split(',');
    if (cells[0] !== 'id') {
        salary += +cells[2];
        age += differenceInYears(new Date(), new Date(cells[3]));
        count++;
    }
})

rl.on('close', () => {
    console.log(`Total salary: ${salary}`);
    console.log(`Total employees: ${count}`);
    console.log(`Average salary: ${salary / count}`);
    console.log(`Average age: ${age / count}`);
})