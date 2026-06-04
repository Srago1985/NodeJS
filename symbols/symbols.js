const id1 = Symbol('id');
const id2 = Symbol('id');

console.log(id1 === id2); // false

const user = {
    name: 'John',
    [id1]: 123,
    [id2]: 456
};

console.log(user[id1]); // 123
console.log(user[id2]); // 456
console.log(user);

const handlePerson = (person) => {
    const id = Symbol('id');
    person[id] = 1000;
    console.log(person);
}

handlePerson(user);

const id3 = Symbol.for('id');
const id4 = Symbol.for('id');
console.log(id3 === id4); // true

console.log(Symbol.keyFor(id3)); // 'id'
console.log(Symbol.keyFor(id1)); // undefined