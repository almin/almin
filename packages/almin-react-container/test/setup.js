const { JSDOM } = require("jsdom");
const jsdom = new JSDOM("<!doctype html><html><body></body></html>");
global.window = jsdom.window;
global.document = jsdom.window.document;
global.navigator = jsdom.window.navigator;
