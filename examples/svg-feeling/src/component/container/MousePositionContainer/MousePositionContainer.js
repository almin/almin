// LICENSE : MIT
"use strict";
const React = require("react");
import AppContextLocator from "../../../AppContextLocator";
import { ChangeWallColorUseCase } from "../../../js/UseCase/ChangeWallColor";
export default class MousePositionContainer extends React.Component {
    constructor() {
        super();
        this.unListenHandler = () => {};
    }

    componentDidMount() {
        const onMouseMoveHandler = event => {
            const x = event.clientX;
            const y = event.clientY;
            const width = window.innerWidth || body.clientWidth;
            const height = window.innerHeight || body.clientHeight;
            AppContextLocator.context.useCase(ChangeWallColorUseCase.create()).execute({ x, y, width, height });
        };
        window.addEventListener("mousemove", onMouseMoveHandler);
        this.unListenHandler = () => {
            window.removeEventListener("mousemove", onMouseMoveHandler);
        };
    }

    componentWillUnmount() {
        if (typeof this.unListenHandler === "function") this.unListenHandler();
    }

    render() {
        return null;
    }
}
