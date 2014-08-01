/*** @jsx React.DOM */

var headerMainReact =
    React.createClass({
        render: function() {
            return (
                <div>
                    <h2>This is header rendering</h2>
                </div>
                ); // end return
        } //end render
    }); //end headerMainReact

React.renderComponent(
    <headerMainReact/>,
    document.getElementById('header')
);
