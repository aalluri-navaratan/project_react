/** @jsx React.DOM */

'use strict';

// Global toggle for shouldComponentUpdate for perf comparisons
var ALWAYS_UPDATE_COMPONENTS = false

/**
 * Gets just type info from an object's toString, in lower case.
 */
function getType(o) {
  return Object.prototype.toString.call(o).slice(8, -1).toLowerCase()
}

/**
 * Gets an appropriate editor constructor based on the given object's type.
 */
function getEditorCtor(o) {
  var type = getType(o)
  var Editor = TYPE_TO_EDITOR[type]
  if (!Editor) {
    throw new Error('No editor available for type: ' + type)
  }
  return Editor
}

/**
 * Creates an object containing the given prop and value.
 */
function makeObj(prop, value) {
  var update = {}
  update[prop] = value
  return update
}

// Container editors

/**
 * Mixin for editors which can be top-level containers (Objects or Arrays).
 */
var ContainerEditorMixin = {
  propTypes: {
    editing: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },
  /**
   * Top-level editors won't have had a "prop" property passed to them by a
   * containing editor.
   */
  isTopLevel: function() {
    return (typeof this.props.prop == 'undefined')
  },
  /**
   * The presence of an "editing" property on a top-level editor controls
   * whether or not it can be used for editing, in which case it will take an
   * initial reference to its value object as state.
   */
  isEditable: function() {
    return (this.isTopLevel() && typeof this.props.editing != 'undefined')
  },
  getInitialState: function() {
    return (this.isEditable() ? {value: this.props.value} : {})
  },
  /**
   * If an editor is being used to edit an object, we need to keep its state
   * up to date with any prop changes.
   */
  componentWillReceiveProps: function(newProps) {
    if (this.isEditable() && newProps.value !== this.props.value) {
      this.setState({value: newProps.value})
    }
  },
  /**
   * Only re-render when we have to. React.addons.update() is being used for
   * state changes, so we can use === to detect them.
   */
  shouldComponentUpdate: function(nextProps, nextState) {
    return (ALWAYS_UPDATE_COMPONENTS ||
            nextProps.editing !== this.props.editing ||                  // switching modes
            this.isEditable() && nextState.value !== this.state.value || // editable value updated
            nextProps.value !== this.props.value)                        // display value updated
  },
  /**
   * Child editors will bubble up objects representing state changes in the
   * format React.addons.update expects. Top-level components are responsible
   * for applying the state changes.
   */
  onChange: function(update) {
    if (this.isTopLevel()) {
      var newState = React.addons.update(this.state.value, update)
      this.setState({value: newState})
      if (this.props.onChange) {
        this.props.onChange(newState)
      }
    }
    else {
      this.props.onChange(makeObj(this.props.prop, update))
    }
  }
}

var ObjectEditor = React.createClass({
  mixins: [ContainerEditorMixin],
  propTypes: {
    value: React.PropTypes.object
  },
  render: function() {
    return <table className="object"><tbody>
      <tr className="brace" colSpan="2"><td>{'{'}</td></tr>
      {this.renderProps()}
      <tr className="brace" colSpan="2"><td>}</td></tr>
    </tbody></table>
  },
  renderProps: function() {
    var obj = this.state.value || this.props.value
    var rendered = []
    Object.keys(obj).forEach(function(prop) {
      var value = obj[prop]
      var Editor = getEditorCtor(value)
      rendered.push(<tr className="line">
        <td className="prop">{prop}</td>
        <td className="value">
          <Editor prop={prop}
                  value={value}
                  editing={this.props.editing}
                  onChange={this.onChange} />
        </td>
      </tr>)
    }, this)
    return rendered
  }
})

var ArrayEditor = React.createClass({
  mixins: [ContainerEditorMixin],
  propTypes: {
    value: React.PropTypes.array
  },
  render: function() {
    return <table className="array"><tbody>
      <tr className="brace" colSpan="2"><td>[</td></tr>
      {this.renderProps()}
      <tr className="brace" colSpan="2"><td>]</td></tr>
    </tbody></table>
  },
  renderProps: function() {
    var arr = this.state.value || this.props.value
    var rendered = []
    for (var i = 0, l = arr.length; i < l; i++) {
      var value = arr[i]
      var Editor = getEditorCtor(value)
      rendered.push(<tr className="line">
        <td className="prop">{i}</td>
        <td className="value">
          <Editor prop={i}
                  value={value}
                  editing={this.props.editing}
                  onChange={this.onChange} />
        </td>
      </tr>)
    }
    return rendered
  }
})

// Value editors

/**
 * Mixin for editors which can't be top-level containers (value objects).
 */
var ValueEditorMixin = {
  propTypes: {
    editing: React.PropTypes.bool,
    onChange: React.PropTypes.func
  }
}

var BooleanEditor = React.createClass({
  mixins: [ValueEditorMixin],
  propTypes: {
    value: React.PropTypes.bool
  },
  onChange: function(e) {
    this.props.onChange(makeObj(this.props.prop, {$set: e.target.checked}))
  },
  render: function() {
    if (!this.props.editing) {
      return <div className="boolean">{new Boolean(this.props.value).toString()}</div>
    }
    return <div className="boolean">
      <input type="checkbox" checked={this.props.value} onChange={this.onChange}/>
    </div>
  }
})

var DateEditor = React.createClass({
  mixins: [ValueEditorMixin],
  propTypes: {
    value: React.PropTypes.instanceOf(Date)
  },
  getInitialState: function(date) {
    date = date || this.props.value
    return {
      errorMessage: null,
      input: date.toISOString().substring(0, 10)
    }
  },
  componentWillReceiveProps: function(newProps) {
    if (newProps.value !== this.props.value) {
      this.setState(this.getInitialState(newProps.value))
    }
  },
  onChange: function(e) {
    this.setState({input: e.target.value}, function() {
      var errorMessage = null
      try {
        var newDate = new Date(this.state.input)
      }
      catch (e) {
        errorMessage = e.message
      }
      if (errorMessage === null &&
          (isNaN(newDate) || newDate.toString() == 'Invalid Date')) {
        errorMessage = 'Invalid Date'
      }
      if (errorMessage === null) {
        this.props.onChange(makeObj(this.props.prop, {$set: newDate}))
      }
      else {
        this.setState({errorMessage: errorMessage})
      }
    }.bind(this))
  },
  render: function() {
    if (!this.props.editing) {
      return <div className="date">{this.state.input}</div>
    }
    return <div className="date">
      <input type="date" value={this.state.input} onChange={this.onChange}/>
      {this.state.errorMessage && <p className="error">{this.state.errorMessage}</p>}
    </div>
  }
})

var NumberEditor = React.createClass({
  mixins: [ValueEditorMixin],
  propTypes: {
    value: React.PropTypes.number
  },
  getInitialState: function(num) {
    num = num || this.props.value
    return {
      errorMessage: null,
      input: num
    }
  },
  componentWillReceiveProps: function(newProps) {
    if (newProps.value !== this.props.value) {
      this.setState(this.getInitialState(newProps.value))
    }
  },
  onChange: function(e) {
    this.setState({input: e.target.value}, function() {
      var newNumber = Number(this.state.input)
      if (!isNaN(newNumber)) {
        this.props.onChange(makeObj(this.props.prop, {$set: newNumber}))
      }
      else {
        this.setState({errorMessage: 'Not a number'})
      }
    }.bind(this))
  },
  render: function() {
    if (!this.props.editing) {
      return <div className="number">{this.state.input}</div>
    }
    return <div className="number">
      <input type="number" step="any" value={this.state.input} onChange={this.onChange}/>
      {this.state.errorMessage && <p className="error">{this.state.errorMessage}</p>}
    </div>
  }
})

var RegExpEditor = React.createClass({
  mixins: [ValueEditorMixin],
  propTypes: {
    value: React.PropTypes.instanceOf(RegExp)
  },
  getInitialState: function(re) {
    re = re || this.props.value
    return {
      g: re.global,
      i: re.ignoreCase,
      m: re.multiline,
      source: re.source,
      errorMessage: null
    }
  },
  componentWillReceiveProps: function(newProps) {
    if (newProps.value !== this.props.value) {
      this.setState(this.getInitialState(newProps.value))
    }
  },
  onChange: function(e) {
    var stateChange = {errorMessage: null}
    if (e.target.name == 'source') {
      stateChange.source = e.target.value
    }
    else {
      stateChange[e.target.name] = e.target.checked
    }
    this.setState(stateChange, function() {
      try {
        var newRegExp = new RegExp(this.state.source, this.getFlags())
        this.props.onChange(makeObj(this.props.prop, {$set: newRegExp}))
      }
      catch (e) {
        this.setState({errorMessage: e.message})
      }
    }.bind(this))
  },
  getFlags: function() {
    var flags = []
    if (this.state.g) flags.push('g')
    if (this.state.i) flags.push('i')
    if (this.state.m) flags.push('m')
    return flags.join('')
  },
  render: function() {
    if (!this.props.editing) {
      return <div className="regexp">/{this.state.source}/{this.getFlags()}</div>
    }
    return <div className="regexp">
      /<input type="text" name="source" value={this.state.source} onChange={this.onChange}/>/
      <label><input type="checkbox" name="g" checked={this.state.g} onChange={this.onChange}/> g</label>
      <label><input type="checkbox" name="i" checked={this.state.i} onChange={this.onChange}/> i</label>
      <label><input type="checkbox" name="m" checked={this.state.m} onChange={this.onChange}/> m</label>
      {this.state.errorMessage && <p className="error">{this.state.errorMessage}</p>}
    </div>
  }
})

var StringEditor = React.createClass({
  mixins: [ValueEditorMixin],
  propTypes: {
    value: React.PropTypes.string
  },
  onChange: function(e) {
    this.props.onChange(makeObj(this.props.prop, {$set: e.target.value}))
  },
  render: function() {
    if (!this.props.editing) {
      return <div className="string">{this.props.value}</div>
    }
    return <div className="string">
      <input type="text" value={this.props.value} onChange={this.onChange}/>
    </div>
  }
})

var TYPE_TO_EDITOR = {
  array: ArrayEditor
, boolean: BooleanEditor
, date: DateEditor
, number: NumberEditor
, object: ObjectEditor
, regexp: RegExpEditor
, string: StringEditor
}

var sampleObject = {
  array: [true, new Date(), 123, /[a-z]\d{9}/i, 'abc']
, boolean: true
, date: new Date()
, number: 123
, object: {
    array: [true, new Date(), 123, /[a-z]\d{9}/i, 'abc']
  , boolean: true
  , date: new Date()
  , number: 123
  , regexp: /[a-z]\d{9}/i
  , string: 'abc'
  }
, regexp: /[a-z]\d{9}/i
, string: 'abc'
}

var App = React.createClass({
  getInitialState: function() {
    return {
      editing: true
    , sampleObject: this.props.object
    , editedObject: this.props.object
    }
  },

  onToggleEditing: function(e) {
    this.setState({editing: e.target.checked})
  },

  onChange: function(editedObject) {
    this.setState({editedObject: editedObject})
  },

  render: function() {
    return <div>
      <div className="editor">
        <h2>Interactive <small><label><input type="checkbox" onChange={this.onToggleEditing} checked={this.state.editing}/> Edit</label></small></h2>
        <ObjectEditor value={this.state.sampleObject} editing={this.state.editing} onChange={this.onChange}/>
      </div>
      <div className="editor">
        <h2>onChange</h2>
        <ObjectEditor value={this.state.editedObject}/>
      </div>
      <div className="editor">
        <h2>Original</h2>
        <ObjectEditor value={this.state.sampleObject}/>
      </div>
    </div>
  }
})

React.renderComponent(<App object={sampleObject}/>, document.getElementById('app'))