/*** @jsx React.DOM */

var tableMainReact =
    React.createClass({
        render: function() {
            return (
                <div>
                    <h2>This is table rendering</h2>
                </div>
                ); // end return
        } //end render
    }); //end tableMainReact

React.renderComponent(
    <tableMainReact/>,
    document.getElementById('table')
);
