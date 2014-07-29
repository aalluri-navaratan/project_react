/** @jsx React.DOM */
 
var ExampleModal = React.createClass({
  mixins: [BootstrapModalMixin]
 
, render: function() {
    var buttons = this.props.buttons.map(function(button) {
      return <button type="button" className={'btn btn-' + button.type} onClick={button.handler}>
        {button.text}
      </button>
    })
 
    return <div className="modal fade">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            {this.renderCloseButton()}
            <strong>{this.props.header}</strong>
          </div>
          <div className="modal-body">
            {this.props.children}
          </div>
          <div className="modal-footer">
            {buttons}
          </div>
        </div>
      </div>
    </div>
  }
})
 
var ExampleApp = React.createClass({
  getInitialState: function() {
    return {
      logs: []
    }
  }
 
, render: function() {
    var buttons = [
        {type: 'danger',  text: 'Hide Modal',  handler: this.handleExternalHide}
      , {type: 'primary', text: 'Do Nothing', handler: this.handleDoingNothing}
      ]
 
    var logs = this.state.logs.map(function(log) {
      return <div className={'alert alert-' + log.type}>
        [<strong>{log.time}</strong>] {log.message}
      </div>
    })
 
    return <div className="panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">Demo</h3>
      </div>
      <div className="panel-body">
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={this.handleShowModal}>Show Modal</button>
        <h3>Logs</h3>
        {logs}
      </div>
      <ExampleModal ref="modal"
        show={false}
        header="Example Modal"
        buttons={buttons}
        handleShow={this.handleLog.bind(this, 'Modal about to show', 'info')}
        handleShown={this.handleLog.bind(this, 'Modal showing', 'success')}
        handleHide={this.handleLog.bind(this, 'Modal about to hide', 'warning')}
        handleHidden={this.handleLog.bind(this, 'Modal hidden', 'danger')}
      >
        <p>I'm the content.</p>
        <p>That's about it, really.</p>
      </ExampleModal>
    </div>
  }
 
, handleShowModal: function() {
    this.refs.modal.show()
  }
 
, handleExternalHide: function() {
    this.refs.modal.hide()
  }
 
, handleDoingNothing: function() {
    this.handleLog("Remember I said I'd do nothing? ...I lied!", 'danger')
  }
 
, handleLog: function(message, type) {
    this.setState({
      logs: [{ type: type
             , time: new Date().toLocaleTimeString()
             , message: message}].concat(this.state.logs.slice(0, 3))
    })
  }
})
 
React.renderComponent(<ExampleApp/>, document.getElementById('example'))