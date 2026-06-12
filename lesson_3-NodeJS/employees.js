import fs from 'node:fs';

fs.readFile('employees.csv', 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');
    const employees = lines.slice(1).map(line => {
        const values = line.split(',');
        const employee = {};
        headers.forEach((header, index) => {
            employee[header] = values[index];
        });
        return employee;
    });
    console.log(employees);
});