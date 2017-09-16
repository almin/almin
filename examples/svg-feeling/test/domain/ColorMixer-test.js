// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import RGBAColor from "../../src/js/domain/value/RGBAColor";
import ColorMixer from "../../src/js/domain/ColorMixer";
describe("ColorMixer-test", function() {
    describe("#createColorFromPosition", function() {
        context("when either missing x or y", function() {
            it("should throw error", function() {
                const colorMixer = new ColorMixer();
                try {
                    colorMixer.createColorFromPosition({ x: 1 });
                    throw new Error("NOT");
                } catch (error) {
                    assert.ok(error instanceof assert.AssertionError);
                }
            });
        });
        context("when { x:0, y:0 }", function() {
            it("should return alpha color", function() {
                const colorMixer = new ColorMixer();
                const color = colorMixer.createColorFromPosition({ x: 0, y: 0, width: 1200, height: 1200 });
                assert(color instanceof RGBAColor);
                assert.equal(color.rgba, "rgba(0, 0, 0, 0)");
            });
        });
        context("when { x:255, y:1000}", function() {
            it("should return alpha color", function() {
                const colorMixer = new ColorMixer();
                const color = colorMixer.createColorFromPosition({ x: 255, y: 1000, width: 1200, height: 1200 });
                assert(color instanceof RGBAColor);
                const [red, green, blue] = color.rgba.match(/\d+/g);
                [red, green, blue].forEach(value => assert(value > 0));
            });
        });
    });
});
