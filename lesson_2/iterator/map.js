const map = new Map();

map.set('name', 'John');
map.set('age', 30);
map.set('city', 'New York');

for (const [key, value] of map) {
    console.log(`${key}: ${value}`);
}

const languages = ['english', 'french', 'german', 'italian', 'english', 'spanish', 'french', 'german', 'italian'];
const languageMap = new Map();

for (const language of languages) {
    if (languageMap.has(language)) {
        languageMap.set(language, languageMap.get(language) + 1);
    } else {
        languageMap.set(language, 1);
    }
}

for (const [language, count] of languageMap) {
    console.log(`${language}: ${count}`);
}