const simpleSpy = require("simple-mock");
export default class ConsoleMock {
    /**
     * create console API mock object and return
     * Console's method are simpleSpy object that record called count
     * @returns {Console}
     */
    static create() {
        var consoleMock = {};
        var prop, method;
        var spy = simpleSpy.spy(function() {});
        var properties = ["memory"];
        var methods = (
            "assert,clear,count,debug,dir,dirxml,error,exception,group," +
            "groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd," +
            "show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn"
        ).split(",");
        while ((prop = properties.pop())) {
            if (!consoleMock[prop]) {
                consoleMock[prop] = {};
            }
        }
        while ((method = methods.pop())) {
            if (typeof consoleMock[method] !== "function") {
                consoleMock[method] = spy;
            }
        }
        return consoleMock;
    }
}
