// console.log(arguments) // proves that we are in a function in reality
// console.log(require('module').wrapper)

// module.exports
const C = require('./module-test-1')
const calc1 = new C()
console.log(calc1.add(33, 9))

// exports
const calc2 = require('./module-test-2')
// or
const { add, mul } = require('./module-test-2')
console.log(calc2.add(33, 9))
console.log(add(33, 9))

// caching
require('./module-test-3')()
require('./module-test-3')()
require('./module-test-3')()
