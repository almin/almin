/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * This component operates as a "Controller-View".  It listens for changes in
 * the TodoStore and passes the new data to its children.
 */

const React = require('react');
import Footer from "./Footer.react";
import Header from "./Header.react";
import MainSection from "./MainSection.react";
const TodoApp = React.createClass({

    getInitialState: function () {
        const appContext = this.props.appContext;
        return appContext.getState();
    },

    componentDidMount: function () {
        const appContext = this.props.appContext;
        this.releaseChange = appContext.onChange(() => {
            this.setState(appContext.getState());
        });
    },

    componentWillUnmount: function () {
        this.releaseChange();
    },

    render: function () {
        const TodoState = this.state.TodoState;
        return (
            <div>
                <Header />
                <MainSection
                    allTodos={TodoState.displayItems}
                    areAllComplete={TodoState.areAllComplete}
                />
                <Footer allTodos={TodoState.items}
                        filterType={TodoState.filterType}/>
            </div>
        );
    }

});

module.exports = TodoApp;
