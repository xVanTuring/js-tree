const Tree = require('./tree')
const util = require('util')
const uuid = require('uuid/v1')
function createTree() {
  return new Tree({
    name: 'root',
    id: uuid(),
    children: [
      {
        name: 'a',
        id: '123',
        children: [
          {
            name: 'c',
            id: uuid()
          }
        ]
      },
      {
        name: 'b',
        id: uuid()
      }
    ]
  });
}
const obj = createTree()
obj.insert({
  name: 'token',
  id: '10007'
}, '123')
console.log(obj)
