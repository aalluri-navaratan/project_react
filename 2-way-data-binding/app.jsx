/** @jsx React.DOM */

function c2f(c) {
  return 9/5 * c + 32
}

function f2c(f) {
  return 5/9 * (f - 32)
}

var TemperatureConverter = React.createClass({
  getInitialState: function() {
    return {c: 0, f: c2f(0)}
  },
  render: function() {
    return <div>
      <input type="number" value={this.state.c} onChange={this.onCelsiusChange}/>°C
      <span> ⇄ </span>
      <input type="number" value={this.state.f} onChange={this.onFahrenheitChange}/>°F
    </div>
  },
  onCelsiusChange: function(e) {
    var c = e.target.value
    this.setState({c: c, f: c2f(c)})
  },
  onFahrenheitChange: function(e) {
    var f = e.target.value
    this.setState({c: f2c(f), f: f})
  }
})

React.renderComponent(<TemperatureConverter/>, document.getElementById('app'))
