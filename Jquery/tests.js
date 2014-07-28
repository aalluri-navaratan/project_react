QUnit.test("OrderedOject", function() {
  var oo

  function assertEmpty(oo) {
    strictEqual(oo._size, 0)
    deepEqual(oo._map, {})
    strictEqual(oo._head, null)
    strictEqual(oo._tail, null)
    strictEqual(oo.containsKey('missing'), false)
    strictEqual(oo.containsValue('missing'), false)
    throws(oo.get.bind(oo, 'missing'))
    throws(oo.pop.bind(oo, 'missing'))
    equal(oo.pop('missing', 'default'), 'default')
    throws(oo.remove.bind(oo, 'missing'))
    deepEqual(oo.keys(), [])
    deepEqual(oo.values(), [])
    deepEqual(oo.items(), [])
    deepEqual(oo.toObject(), {})
    strictEqual(oo.size(), 0)
  }

  // Creation - implicitly tests updating and toObject
  oo = OrderedObject({test1: 1, test2: 2})
  deepEqual(oo.toObject(), {test1: 1, test2: 2}, 'created with object')

  oo = OrderedObject([['test1', 1], ['test2', 2]])
  deepEqual(oo.toObject(), {test1: 1, test2: 2}, 'created with initial pairs')

  oo = OrderedObject(OrderedObject({test1: 1, test2: 2}))
  deepEqual(oo.toObject(), {test1: 1, test2: 2}, 'created with initial OrderedObject')

  var oo = OrderedObject()
  assertEmpty(oo)

  // Putting and re-putting to update
  oo.put('firstName', '0')
  equal(oo.size(), 1)
  strictEqual(oo.get('firstName'), '0')
  strictEqual(oo.putDefault('firstName', '1'), '0', 'putDefault returns existing value if present')
  strictEqual(oo.get('firstName'), '0', 'existing value not touched after putDefault returned default value')
  oo.put('firstName', '1')
  strictEqual(oo.get('firstName'), '1')

  // Updating existing
  oo = OrderedObject({firstName: '1'})
  oo.update({lastName: '2' , phoneNumber: '3'})
  equal(oo.size(), 3)
  deepEqual(oo.keys(), ['firstName', 'lastName', 'phoneNumber'])
  deepEqual(oo.values(), ['1', '2', '3'])

  // Numeric keys should keep insertion order
  oo.put('123', 'test1')
  deepEqual(oo.keys(), ['firstName', 'lastName', 'phoneNumber', '123'], 'numeric key in insertion order')
  oo.remove('phoneNumber')
  deepEqual(oo.keys(), ['firstName', 'lastName', '123'], 'remove')
  oo.put('456', 'test2')
  deepEqual(oo.keys(), ['firstName', 'lastName', '123', '456'], 'numeric key in insertion order')

  // Popping
  var defaultArray = []
  strictEqual(oo.pop('missing', defaultArray), defaultArray, 'pop returned default for missing key')
  equal(oo.pop('lastName'), '2', 'pop returned removed value')
  /// XXX It was about here that I discovered my project's unit tests were wrong and I didn't need an OrderedObject yet after all...
  throws(function() { oo.pop('no default provided') })
})