/*

Assumptions
-----------

These aren't prescriptive, they're just a log of the decisions that had to be
made when writing the code below:

* User input maps directly to context component state by name

* State for the following inputs which represent multiple values with the same
  name is an Array of Strings:

  * Multiple selects
  * Checkbox groups

* If a checkbox is not part of a same-named group, its state is Boolean

* The user agent implements/has:

  * Array.isArray()
  * Array.prototype.indexOf()
  * NodeList or HTMLCollection type for same-named inputs in form.elements

*/

function handleFormInputChange(e) {
  var el = e.target
  var name = el.name
  var type = el.type
  var stateChange = {}

  if (type == 'select-multiple') {
    var selectedOptions = []
    for (var i = 0, l = el.options.length; i < l; i++) {
      if (el.options[i].selected) {
        selectedOptions.push(el.options[i].value)
      }
    }
    stateChange[name] = selectedOptions
  }
  else if (type == 'checkbox') {
    var objType = Object.prototype.toString.call(el.form.elements[name])
    if (objType == '[object NodeList]' || objType == '[object HTMLCollection]') {
      var checkedBoxes = (Array.isArray(this.state[name]) ? this.state[name].slice() : [])
      if (el.checked) {
        checkedBoxes.push(el.value)
      }
      else {
        checkedBoxes.splice(checkedBoxes.indexOf(el.value), 1)
      }
      stateChange[name] = checkedBoxes
    }
    else {
      stateChange[name] = el.checked
    }
  }
  else {
    stateChange[name] = el.value
  }

  this.setState(stateChange)
}
