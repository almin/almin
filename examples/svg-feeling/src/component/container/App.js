// LICENSE : MIT
"use strict";
const React = require("react");
import AppContextLocator from "../../AppContextLocator";
import PlaygroundContainer from "./PlaygroundContainer/PlaygroundContainer";
import HistoryContainer from "./HistoryContainer/HistoryContainer";
import MousePositionContainer from "./MousePositionContainer/MousePositionContainer";
// Container
export default class App extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = AppContextLocator.context.getState();
    }

    componentDidMount() {
        const context = AppContextLocator.context;
        // when change store, update component
        const onChangeHandler = () => {
            return requestAnimationFrame(() => {
                this.setState(context.getState());
            });
        };
        context.onChange(onChangeHandler);
    }

    render() {
        const { ColorState, ColorHistoryState, WallColorState } = this.state;
        const { wallColor } = WallColorState;
        const style = {
            backgroundColor: wallColor.rgba
        };
        return (
            <div className="App" style={style}>
                <MousePositionContainer />
                <PlaygroundContainer ColorState={ColorState} />
                <HistoryContainer ColorHistoryState={ColorHistoryState} />
            </div>
        );
    }
}
