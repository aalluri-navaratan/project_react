// Hash and OrderedObject initially based on http://dailyjs.com/2012/09/24/linkedhashmap/

;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory)
  }
  else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory()
  }
  else {
    // Browser globals (root is window)
    root.OrderedObject = factory()
  }
}(this, function() {

'use strict';

var hasOwn = Object.prototype.hasOwnProperty

function extend(dest, src) {
  var keys = Object.keys(src)
  for (var i = 0, l = keys.length; i < l; i++) {
    dest[keys[i]] = src[keys[i]]
  }
  return dest
}

function inherits(childConstructor, parentConstructor) {
  var F = function() {}
  F.prototype = parentConstructor.prototype
  childConstructor.prototype = new F()
  childConstructor.prototype.constructor = childConstructor
  return childConstructor
}

/**
 * @constructor
 * @param {(Hash|array|object)=} initial
 */
function Hash(initial) {
  if (!(this instanceof Hash)) { return new Hash(initial) }
  this._size = 0
  this._map = {}
  if (initial) {
    this.update(initial)
  }
}

/**
 * @param {string} key
 * @param {*} value
 */
Hash.prototype.put = function(key, value) {
  if (!this.containsKey(key)) {
    this._size++
  }
  this._map[key] = value
}

/**
 * @param {string} key
 * @param {*=} defaultValue
 * @return {*}
 */
Hash.prototype.putDefault = function(key, defaultValue) {
  if (this.containsKey(key)) {
    return this._map[key]
  }
  if (arguments.length == 1) {
    defaultValue = null
  }
  this.put(key, defaultValue)
  return defaultValue
}

/**
 * @param {(Hash|array|object)} obj
 */
Hash.prototype.update = function(obj) {
  var keys, i, l
  if (obj instanceof Hash) {
    keys = Object.keys(obj._map)
    for (i = 0, l = keys.length; i < l; i++) {
      this.put(keys[i], obj._map[keys[i]])
    }
  }
  else if (Array.isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      if (obj[i].length != 2) {
        throw new Error("update was given an Array which didn't have a pair at index " + i)
      }
      this.put(obj[i][0], obj[i][1])
    }
  }
  else {
    keys = Object.keys(obj)
    for (i = 0, l = keys.length; i < l; i++) {
      this.put(keys[i], obj[keys[i]])
    }
  }
}

/**
 * @param {string} key
 * @return {boolean}
 */
Hash.prototype.containsKey = function(key) {
  return hasOwn.call(this._map, key)
}

/**
 * @param {*} value
 * @return {boolean}
 */
Hash.prototype.containsValue = function(value) {
  for (var key in this._map) {
    if (hasOwn.call(this._map, key)) {
      return (this._map[key] === value)
    }
  }
  return false
}

/**
 * @param {string} key
 * @param {*=} defaultValue
 * @return {*}
 */
Hash.prototype.get = function(key, defaultValue) {
  if (this.containsKey(key)) {
    return this._map[key]
  }
  else if (arguments.length == 1) {
    throw new Error('KeyError: ' + key)
  }
  return defaultValue
}

/**
 * @param {string} key
 * @param {*=} defaultValue
 * @return {*}
 */
Hash.prototype.pop = function(key, defaultValue) {
  if (this.containsKey(key)) {
    this._size --
    var value = this._map[key]
    delete this._map[key]
    return value
  }
  else if (arguments.length == 1) {
    throw new Error('KeyError: ' + key)
  }
  return defaultValue
}

/**
 * @param {string} key
 * @return {*}
 */
Hash.prototype.remove = function(key) {
  if (!this.containsKey(key)) {
    throw new Error('KeyError: ' + key)
  }
  this._size--
  var value = this._map[key]
  delete this._map[key]
  return value
}

Hash.prototype.clear = function() {
  this._size = 0
  this._map = {}
}

/**
 * @return {Array.<string>} keys.
 */
Hash.prototype.keys = function() {
  return Object.keys(this._map)
}

/**
 * @return {Array.<*>} values.
 */
Hash.prototype.values = function() {
  var keys = this.keys()
  var values = []
  for (var i = 0, l = keys.length; i < l; i++) {
    values.push(this._map[keys[i]])
  }
  return values
}

/**
 * @return {Array.<Array>} [key, value] pairs.
 */
Hash.prototype.items = function() {
  var keys = this.keys()
  var items = []
  for (var i = 0, l = keys.length; i < l; i++) {
    items.push([keys[i], this._map[keys[i]]])
  }
  return items
}

/**
 * @return {Object.<string, *>} key => value object
 */
Hash.prototype.toObject = function() {
  return extend({}, this._map)
}

/**
 * @return {number}
 */
Hash.prototype.size = function() {
  return this._size
}

/**
 * @constructor
 * @param {*} value
 */
function Entry(value) {
  this.prev = null
  this.next = null
  this.value = value
}

/**
 * Based on http://dailyjs.com/2012/09/24/linkedhashmap/
 * @constructor
 * @param {(OrderedObject|Hash|array|object)=} initial
 */
var OrderedObject = function OrderedObject(initial) {
  if (!(this instanceof OrderedObject)) { return new OrderedObject(initial) }
  this._head = this._tail = null
  Hash.apply(this, arguments)
}
inherits(OrderedObject, Hash)

/**
 * @param {string} key
 * @param {*} value
 */
OrderedObject.prototype.put = function(key, value) {
  if (!this.containsKey(key)) {
    var entry = new Entry(key)
    if (this.size() === 0) {
      this._head = entry
      this._tail = entry
    }
    else {
      this._tail.next = entry
      entry.prev = this._tail
      this._tail = entry
    }
    Hash.prototype.put.call(this, key, {value: value, entry: entry})
  }
  else {
    // Update the stored value directly
    Hash.prototype.get.call(this, key).value = value
  }
}

/**
 * @param {string} key
 * @param {*=} defaultValue
 * @return {*}
 */
OrderedObject.prototype.putDefault = function(key, defaultValue) {
  var value = Hash.prototype.putDefault.apply(this, arguments)
  return (value !== null && value !== defaultValue ? value.value : value)
}

/**
 * @param {(OrderedObject|Hash|array|object)} obj
 */
OrderedObject.prototype.update = function(obj) {
  if (obj instanceof OrderedObject) {
    for (var cur = obj._head; cur !== null; cur = cur.next) {
      this.put(cur.value, obj.get(cur.value))
    }
  }
  else {
    Hash.prototype.update.apply(this, arguments)
  }
}

/**
 * @param {string} key
 * @param {*=} defaultValue
 * @return {*}
 */
OrderedObject.prototype.get = function(key, defaultValue) {
  var value = Hash.prototype.get.apply(this, arguments)
  return (value !== defaultValue ? value.value : value)
}

/**
 * @param {string} key
 * @param {*=} defaultValue
 * @return {*}
 */
OrderedObject.prototype.pop = function(key, defaultValue) {
  var value = Hash.prototype.pop.apply(this, arguments)
  return (value !== defaultValue ? value.value : value)
}

/**
 * @return {*}
 */
OrderedObject.prototype.remove = function(key) {
  var value = Hash.prototype.remove.apply(this, arguments)
  var entry = value.entry
  if (entry === this._head) {
    this._head = entry.next
    this._head.prev = null
  }
  else if (entry === this._tail) {
    this._tail = entry.prev
    this._tail.next = null
  }
  else {
    entry.prev.next = entry.next
    entry.next.prev = entry.prev
  }
  return value.value
}

OrderedObject.prototype.clear = function() {
  this._head = this._tail = null
  Hash.prototype.clear.apply(this, arguments)
}

/**
 * @return {Array.<string>} keys in insertion order.
 */
OrderedObject.prototype.keys = function() {
  var keys = []
  for (var cur = this._head; cur !== null; cur = cur.next) {
    keys.push(cur.value)
  }
  return keys
}

/**
 * @return {Array.<*>} values in key insertion order.
 */
OrderedObject.prototype.values = function() {
  var values = []
  for (var cur = this._head; cur !== null; cur = cur.next) {
    values.push(this.get(cur.value))
  }
  return values
}

/**
 * @return {Array.<Array>} [key, value] pairs in key insertion order.
 */
OrderedObject.prototype.items = function() {
  var items = []
  for (var cur = this._head; cur !== null; cur = cur.next) {
    items.push([cur.value, this.get(cur.value)])
  }
  return items
}

/**
 * @return {Object.<string, *>} key => value object with properties added in key
 *                              insertion order.
 */
OrderedObject.prototype.toObject = function() {
  var obj = {}
  for (var cur = this._head; cur !== null; cur = cur.next) {
    obj[cur.value] = this.get(cur.value)
  }
  return obj
}

return OrderedObject

}))