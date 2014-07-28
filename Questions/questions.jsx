/**
* @jsx React.DOM
*/
 
// =================================================================== Utils ===
 
function extend(dest) {
for (var i = 1; i < arguments.length; i++) {
var src = arguments[i]
if (src) {
for (var prop in src) {
if (Object.hasOwnProperty.call(src, prop)) {
dest[prop] = src[prop]
}
}
}
}
return dest
}
 
function inherits(sub, super_) {
sub.prototype = Object.create(super_.prototype)
sub.prototype.constructor = sub
return sub
}
 
// ======================================================== React Components ===
 
function renderError(error) {
return error && <p className="error">{error}</p>
}
 
/**
* Simple component which displays a question code and a label.
*/
var LabelView = React.createClass({
render: function() {
return <div className="pure-control-group question question-label">
<div className="pure-g">
<div className="pure-u-1-12"><label><strong>{this.props.code}</strong></label></div>
<div className="pure-u-11-12"><label>{this.props.text}</label></div>
</div>
</div>
}
})
 
/**
* Common properties and utility methods for Question components.
*/
var QuestionMixin = {
propTypes: {
code: React.PropTypes.string.isRequired,
error: React.PropTypes.string,
handleResponse: React.PropTypes.func.isRequired,
prefix: React.PropTypes.string,
response: React.PropTypes.any,
text: React.PropTypes.string.isRequired
},
 
/**
* Creates unique names.
*/
getName: function(suffix) {
var name = this.props.code
if (this.props.prefix) {
name = this.props.prefix + '_' + name
}
if (suffix) {
name += "_" + suffix
}
return name
}
}
 
/**
* A question which provides Yes/No responses as radio buttons.
*/
var YesNoQuestionView = React.createClass({
mixins: [QuestionMixin],
 
handleChange: function(e) {
this.props.handleResponse(this.props.code, e.target.value)
},
 
render: function() {
var name = this.getName()
return <div className="pure-control-group question">
{renderError(this.props.error)}
<div className="pure-g">
<div className="pure-u-1-12"><label><strong>{this.props.code}</strong></label></div>
<div className="pure-u-11-12">
<label>{this.props.text}</label>
<label className="pure-radio"><input name={name} type="radio" value="Yes" onChange={this.handleChange} defaultChecked={this.props.response == 'Yes'}/> Yes</label>
<label className="pure-radio"><input name={name} type="radio" value="No" onChange={this.handleChange} defaultChecked={this.props.response == 'No'}/> No</label>
</div>
</div>
</div>
}
})
 
/**
* A question which provides a free-form textarea.
*/
var FreeformQuestionView = React.createClass({
mixins: [QuestionMixin],
 
handleChange: function(e) {
this.props.handleResponse(this.props.code, e.target.value)
},
 
render: function() {
var id = this.getName()
return <div className="pure-control-group question">
{renderError(this.props.error)}
<div className="pure-g">
<div className="pure-u-1-12"><label htmlFor={id}><strong>{this.props.code}</strong></label></div>
<div className="pure-u-11-12">
<label htmlFor={id}>{this.props.text}</label>
<textarea id={id} onChange={this.handleChange} defaultValue={this.props.response || ''}/>
</div>
</div>
</div>
}
})
 
/**
* A question which provides a selectable option.
*/
var SelectableOptionView = React.createClass({
mixins: [QuestionMixin],
 
render: function() {
var defaultChecked = (this.props.response === true)
return <div className="selectable-option">
<div className="pure-g">
<div className="pure-u-1-12"></div>
<div className="pure-u-11-12">
<label className="pure-checkbox"><input type="checkbox" defaultChecked={defaultChecked} onChange={this.handleChange}/> {this.props.text}</label>
</div>
</div>
</div>
},
 
handleChange: function(e) {
this.props.handleResponse(this.props.code, e.target.checked)
}
})
 
/**
* Renders the questions in a QuestionSet object and manages updating of
* response state as they're entered and triggering of validation.
*/
var QuestionSetView = React.createClass({
propTypes: {
q: React.PropTypes.instanceOf(QuestionSet)
},
 
validate: function() {
this.props.q.validate()
this.forceUpdate()
},
 
handleResponse: function(code, response) {
this.props.q.responses[code] = response
this.props.q.validateOne(code)
this.forceUpdate()
},
 
render: function() {
var q = this.props.q
var components = []
q.questions.forEach(function(question) {
// Skip display of questions which have an unsatisfied askWhen condition
if (!question.shouldBeAsked(q.responses)) {
return
}
var component = question.render({
key: question.code,
prefix: q.prefix,
response: q.responseFor(question),
error: q.errorFor(question),
handleResponse: this.handleResponse
})
components.push(component)
}.bind(this))
return <div>
{components}
<button type="button" onClick={this.validate} className="pure-button pure-button-primary">Validate</button>
<pre>Response JSON: {JSON.stringify(q.responses, null, 2)}</pre>
</div>
}
})
 
/**
* Allows selection of the available Question Sets for previewing.
*/
var App = React.createClass({
getInitialState: function() {
return {
code: this.props.code || ''
}
},
 
onChange: function(e) {
var code = e.target.value
if (code !== this.state.code) {
this.setState({code: e.target.value})
}
},
 
render: function() {
var q
if (this.state.code) {
var q = new QuestionSet(QUESTION_SETS[this.state.code])
}
return <div>
<form className="pure-form pure-form-stacked">
<div className="pure-g">
<div className="pure-u-1-12"></div>
<div className="pure-u-11-12">
<label htmlFor="questionSet">Question Set:</label>
<select id="questionSet" onChange={this.onChange} onKeyUp={this.onChange} defaultValue={this.state.code}><option></option>{this.renderSets()}</select>
</div>
</div>
{q && <div>
<h2>{q.name}</h2>
<QuestionSetView q={q}/>
</div>}
</form>
</div>
},
 
renderSets: function() {
var codes = Object.keys(QUESTION_SETS)
codes.sort()
return codes.map(function(code) {
return <option value={code}>{code} - {QUESTION_SETS[code].name}</option>
})
}
})
 
// =================================================================== Model ===
 
var TYPE_TO_MODEL = {
freeform: FreeformQuestion,
label: Label,
selectableoption: SelectableOption,
yesno: YesNoQuestion
}
 
function QuestionSet(props, responses) {
this.code = props.code
this.prefix = props.prefix
this.questions = props.questions.map(function(props) {
var model = TYPE_TO_MODEL[props.type]
if (!model) {
throw new Error('Unknown type: ' + JSON.stringify(props))
}
return new model(props)
})
this.responses = responses || {}
this.errors = {}
}
 
QuestionSet.prototype.validate = function() {
var errors = {}
var valid = true
this.questions.forEach(function(question) {
if (!question.shouldBeAsked(this.responses)) {
return
}
var response = this.responses[question.code]
var error = question.validate(response)
if (error) {
if (valid) {
valid = false
}
errors[question.code] = error
}
}.bind(this))
this.errors = errors
if (valid) {
return this.responses
}
}
 
QuestionSet.prototype.validateOne = function(questionCode) {
// XXX Quick hack for clearing error status for a question if it has a
// respoonse.
if (this.responses[questionCode] && this.errors[questionCode]) {
delete this.errors[questionCode]
}
}
 
QuestionSet.prototype.responseFor = function(question) {
return this.responses[question.code]
}
 
QuestionSet.prototype.errorFor = function(question) {
return this.errors[question.code]
}
 
function Question(props) {
this.type = props.type
this.code = props.code
this.text = props.text
this.askWhen = props.askWhen
}
 
Question.prototype.shouldBeAsked = function(responses) {
if (this.askWhen) {
var parts = this.askWhen.split(' = ')
var code = parts[0]
var condition = parts[1]
if (responses[code] != condition) {
return false
}
}
return true
}
 
// All questions default to optional
Question.prototype.validate = function(response) {}
 
Question.prototype.render = function(props) {
var props = extend({}, this, props)
return this.view(props)
}
 
function Label(props) {
Question.call(this, props)
}
inherits(Label, Question)
Label.prototype.view = LabelView
 
function YesNoQuestion(props) {
Question.call(this, props)
}
inherits(YesNoQuestion, Question)
YesNoQuestion.prototype.view = YesNoQuestionView
 
YesNoQuestion.prototype.validate = function(response) {
if (!response) {
return 'Please provide a response'
}
}
 
function FreeformQuestion(props) {
Question.call(this, props)
}
inherits(FreeformQuestion, Question)
FreeformQuestion.prototype.view = FreeformQuestionView
 
function SelectableOption(props) {
Question.call(this, props)
}
inherits(SelectableOption, Question)
SelectableOption.prototype.view = SelectableOptionView
 
// ==================================================================== Init ===
 
React.renderComponent(<App code="1"/>, document.getElementById('app'))