const phi = [1,1,2,3,5,8,13,21,34,55];
for (const n of phi) {
    console.log(n);
}

const lorem = 'Lorem ipsum ';
for (const c of lorem) {
    console.log(c);
}

const set = new Set();
set.add(1).add(2).add(3).add('four').add('five');
for (const item of set) {
    console.log(item);
}

export function removeDuplicates(array) {
    const set = new Set(array);
    return Array.from(set);
}