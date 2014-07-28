/**
 * @jsx React.DOM
 */

var INPUT_TYPES = 'color|date|datetime|datetime-local|file|month|number|password|range|search|tel|text|time|url|week'.split('|')

var App = React.createClass({
  getInitialState: function() {
    return {}
  },

  onChange: handleFormInputChange,

  render: function() {
    return <form className="pure-form pure-form-stacked">
      <div className="pure-control-group">
        <input name="input" onChange={this.onChange} placeholder="input"/>
      </div>
      {INPUT_TYPES.map(function(type) {
        var name = 'input[' + type + ']'
        return <div className="pure-control-group">
          <input type={type} name={name} onChange={this.onChange} placeholder={name}/>
        </div>
      }.bind(this))}
      <div className="pure-control-group">
        <textarea name="textarea" onChange={this.onChange} placeholder="textarea"></textarea>
      </div>
      <div className="pure-control-group">
        <label className="pure-checkbox">
          <input type="checkbox" name="checkbox" onChange={this.onChange}/> Single checkbox
        </label>
      </div>
      <div className="pure-control-group">
        <label className="pure-checkbox">
          <input type="checkbox" name="checkbox-multiple" value="1" onChange={this.onChange}/> Multi-checkbox 1
        </label>
        <label className="pure-checkbox">
          <input type="checkbox" name="checkbox-multiple" value="2" onChange={this.onChange}/> Multi-checkbox 2
        </label>
        <label className="pure-checkbox">
          <input type="checkbox" name="checkbox-multiple" value="3" onChange={this.onChange}/> Multi-checkbox 3
        </label>
      </div>
      <div className="pure-control-group">
        <label className="pure-radio">
          <input type="radio" name="radio" value="1" onChange={this.onChange}/> Radio 1
        </label>
        <label className="pure-radio">
          <input type="radio" name="radio" value="2" onChange={this.onChange}/> Radio 2
        </label>
      </div>
      <div className="pure-control-group">
        <select name="select-one" onChange={this.onChange}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
        </select>
      </div>
      <div className="pure-control-group">
        <select name="select-multiple" multiple onChange={this.onChange}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
        </select>
      </div>
      <pre>this.state: {JSON.stringify(this.state, null, 2)}</pre>
    </form>
  }
})

React.renderComponent(<App/>, document.getElementById('app'))