function range(start, end) {
    this.start = start;
    this.end = end;
    this[Symbol.iterator] = function () {
        return {
            current: start,
            last: end,
            next() {
                if (this.current <= this.last) {
                    return { done: false, value: this.current++ };
                } else {
                    return { done: true };
                }
            }
        };
    };
};

for (let num of new range(1, 7)) {
    console.log(num);
}