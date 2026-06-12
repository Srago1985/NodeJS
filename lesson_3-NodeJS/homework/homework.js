import fs from 'node:fs';

function parseCSVLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    fields.push(current);
    return fields;
}

fs.readFile('train.csv', 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const lines = data.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const passengers = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((header, i) => {
            obj[header.trim()] = values[i] !== undefined ? values[i].trim() : '';
        });
        return obj;
    });

    // 1. Total fares
    const totalFares = passengers.reduce((sum, p) => {
        const fare = parseFloat(p.Fare);
        return sum + (isNaN(fare) ? 0 : fare);
    }, 0);
    console.log(`1. Total fares: ${totalFares.toFixed(2)}`);

    // 2. Average fare per class
    [1, 2, 3].forEach(cls => {
        const classPassengers = passengers.filter(p => parseInt(p.Pclass) === cls);
        const classFares = classPassengers.reduce((sum, p) => {
            const fare = parseFloat(p.Fare);
            return sum + (isNaN(fare) ? 0 : fare);
        }, 0);
        const avg = classPassengers.length > 0 ? classFares / classPassengers.length : 0;
        console.log(`2. Average fare for class ${cls}: ${avg.toFixed(2)}`);
    });

    // 3. Total survived and non-survived
    const survived = passengers.filter(p => p.Survived === '1').length;
    const notSurvived = passengers.filter(p => p.Survived === '0').length;
    console.log(`3. Survived: ${survived}, Not survived: ${notSurvived}`);

    // 4. Survived/non-survived by men, women, children (under 18)
    const groups = {
        men: p => p.Sex === 'male' && (parseFloat(p.Age) >= 18 || p.Age === ''),
        women: p => p.Sex === 'female' && (parseFloat(p.Age) >= 18 || p.Age === ''),
        children: p => p.Age !== '' && parseFloat(p.Age) < 18,
    };

    for (const [group, filter] of Object.entries(groups)) {
        const groupPassengers = passengers.filter(filter);
        const groupSurvived = groupPassengers.filter(p => p.Survived === '1').length;
        const groupNotSurvived = groupPassengers.filter(p => p.Survived === '0').length;
        console.log(`4. ${group}: survived=${groupSurvived}, not survived=${groupNotSurvived}`);
    }
});
