/*
 * Flocking MIDI Unit Generator Unit Tests
 * https://github.com/continuing-creativity/flocking-midi
 *
 * Copyright 2011-2020, Colin Clark
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

/*global jqUnit, Uint8Array*/

"use strict";

var flock = fluid.registerNamespace("flock");

// TODO: Port these to ordinary Infusion IoC Tests
fluid.defaults("flock.test.midi.portMatcherTests", {
    gradeNames: [
        "flock.test.module.noEnvironment",
        "flock.test.module.runOnCreate"
    ],

    name: "flock.midi.findPorts.lowerCaseContainsMatcher tests",

    testPort: {
        manufacturer: "KORG INC.",
        name: "SLIDER/KNOB"
    },

    testSpecs: [
        {
            name: "Single-property complete match",
            matchSpec: {
                manufacturer: "KORG INC."
            },
            shouldMatch: true
        },
        {
            name: "Single property mismatch",
            matchSpec: {
                manufacturer: "AKAI"
            },
            shouldMatch: false
        },
        {
            name: "Multiple property complete match",
            matchSpec: {
                manufacturer: "KORG INC.",
                name: "SLIDER/KNOB"
            },
            shouldMatch: true
        },
        {
            name: "Multiple property mismatch",
            matchSpec: {
                manufacturer: "AKAI",
                name: "SLIDER/KNOB"
            },
            shouldMatch: false
        },
        {
            name: "Single property partial match",
            matchSpec: {
                manufacturer: "KORG"
            },
            shouldMatch: true
        },
        {
            name: "Multiple property partial match",
            matchSpec: {
                manufacturer: "KORG",
                name: "SLIDER"
            },
            shouldMatch: true
        },
        {
            name: "Single property wildcard match",
            matchSpec: {
                name: "*"
            },
            shouldMatch: true
        },
        {
            name: "Multiple property wildcard match",
            matchSpec: {
                manufacturer: "KORG INC.",
                name: "*"
            },
            shouldMatch: true
        }
    ],

    invokers: {
        run: {
            funcName: "flock.test.midi.portMatcherTests.run",
            args: [
                "{that}.options.testPort",
                "{that}.options.testSpecs"
            ]
        }
    }
});


flock.test.midi.portMatcherTests.test = function (testPort, testSpec) {
    jqUnit.test(testSpec.name, function () {
        var matcher = flock.midi.findPorts.lowerCaseContainsMatcher(testSpec.matchSpec);

        var msg = testSpec.shouldMatch ? "The match specification should have matched the port." :
            "The match specification should not have matched the port.";

        var didMatch = matcher(testPort);

        jqUnit.assertEquals(msg, testSpec.shouldMatch, didMatch);
    });
};

flock.test.midi.portMatcherTests.run = function (testPort, testSpecs) {
    fluid.each(testSpecs, function (testSpec) {
        flock.test.midi.portMatcherTests.test(testPort, testSpec);
    });
};

flock.test.midi.portMatcherTests();


fluid.defaults("flock.test.midi.messageTests", {
    gradeNames: [
        "flock.test.module.runOnCreate",
        "fluid.test.module.noEnvironment"
    ],

    testSpecs: {
        "note on": {
            messageSpec: {
                type: "noteOn",
                channel: 0,
                note: 60,
                velocity: 69
            },
            bytes: [0x90, 0x3C, 0x45]
        },

        "note off": {
            messageSpec: {
                channel: 0,
                note: 60,
                type: "noteOff",
                velocity: 0
            },
            bytes: [0x80, 0x3C, 0x00]
        },

        "aftertouch (non-poly)": {
            messageSpec: {
                type: "aftertouch",
                channel: 0,
                pressure: 87
            },
            bytes: [0xD0, 0x57]
        },

        "control": {
            messageSpec: {
                type: "control",
                channel: 2,
                number: 74,
                value: 116
            },
            bytes: [0xB2, 0x4A, 0x74]
        },

        "program change": {
            messageSpec: {
                program: 7,
                channel: 2,
                type: "program"
            },
            bytes: [0xC2, 0x07]
        },

        "pitchbend": {
            messageSpec: {
                type: "pitchbend",
                channel: 1,
                value: 5888
            },
            bytes: [0xE1, 0x00, 0x2E]
        },

        "sysex without framing bytes included": {
            messageSpec: {
                type: "sysex",
                data: [0, 32, 8, 16, 127, 0, 1]
            },
            bytes: [0xF0, 0x00, 0x20, 0x08, 0x10, 0x7F, 0x00, 0x01, 0xF7]
        },

        "song position pointer": {
            messageSpec: {
                type: "songPointer",
                value: 1
            },
            bytes: [0xF2, 0x01, 0x00]
        },

        "song select": {
            messageSpec: {
                type: "songSelect",
                value: 1
            },
            bytes: [0xF3, 0x01, 0x00]
        },

        "tune request": {
            messageSpec: {
                type: "tuneRequest"
            },
            bytes: [0xF6]
        },

        "clock": {
            messageSpec: {
                type: "clock"
            },
            bytes: [0xF8]
        },

        "clock start": {
            messageSpec: {
                type: "start"
            },
            bytes: [0xFA]
        },

        "clock continue": {
            messageSpec: {
                type: "continue"
            },
            bytes: [0xFB]
        },

        "clock stop": {
            messageSpec: {
                type: "stop"
            },
            bytes: [0xFC]
        },

        "reset": {
            messageSpec: {
                type: "reset"
            },
            bytes: [0xFF]
        },

        "active sense": {
            messageSpec: {
                type: "activeSense"
            },
            bytes: [0xFE]
        }
    },

    invokers: {
        test: "fluid.notImplemented",

        run: {
            funcName: "flock.test.midi.messageTests.run",
            args: "{that}"
        }
    }
});

flock.test.midi.messageTests.run = function (that) {
    fluid.each(that.options.testSpecs, function (testSpec, name) {
        that.test(testSpec, name);
    });
};


fluid.defaults("flock.test.midi.encodingTests", {
    gradeNames: "flock.test.midi.messageTests",

    name: "MIDI encoding tests",

    testSpecs: {
        "sysex without framing bytes": {
            messageSpec: {
                type: "sysex",
                data: [0, 32, 8, 16, 127, 0, 1]
            },
            bytes: [0xF0, 0x00, 0x20, 0x08, 0x10, 0x7F, 0x00, 0x01, 0xF7]
        },

        "sysex with only the closing byte": {
            messageSpec: {
                type: "sysex",
                data: [0, 32, 8, 16, 127, 0, 1, 0xF7]
            },
            shouldFail: true
        },

        "sysex with only the opening byte": {
            messageSpec: {
                type: "sysex",
                data: [0xF0, 0, 32, 8, 16, 127, 0, 1]
            },
            shouldFail: true
        },

        "sysex with both opening and closing bytes": {
            messageSpec: {
                type: "sysex",
                data: [0xF0, 0, 32, 8, 16, 127, 0, 1, 0xF7]
            },
            shouldFail: true
        }
    },

    invokers: {
        test: {
            funcName: "flock.test.midi.encodingTests.testEncoding",
            args: [
                "{that}",
                "{arguments}.0",
                "{arguments}.1"
            ]
        }
    }
});

flock.test.midi.encodingTests.testEncoding = function (that, testSpec, name) {
    jqUnit.test("Encode a " + name + " message", function () {
        try {
            var actual = flock.midi.write(testSpec.messageSpec);
            if (testSpec.shouldFail) {
                jqUnit.fail("The write call should not have succeeded.");
            }
            else {
                jqUnit.assertDeepEq("The MIDI messageSpec have been correctly encoded as raw bytes.", new Uint8Array(testSpec.bytes), actual);
            }
        }
        catch (error) {
            if (testSpec.shouldFail) {
                jqUnit.assert("The call failed, as expected.");
            }
            else {
                jqUnit.fail("The call should have failed, but did not.");
            }
        }
    });
};

flock.test.midi.encodingTests();


fluid.defaults("flock.test.midi.decodingTests", {
    gradeNames: "flock.test.midi.messageTests",

    name: "MIDI decoding tests",

    testSpecs: {
        "note off as zero-velocity note on": {
            messageSpec: {
                channel: 0,
                note: 60,
                type: "noteOff",
                velocity: 0
            },
            bytes: [0x90, 0x3C, 0x00]
        }
    },

    invokers: {
        test: {
            funcName: "flock.test.midi.decodingTests.testDecoding",
            args: [
                "{that}",
                "{arguments}.0",
                "{arguments}.1"
            ]
        }
    }
});

flock.test.midi.decodingTests.testDecoding = function (that, testSpec, name) {
    jqUnit.test("Decode a " + name + " message", function () {
        var actual = flock.midi.read(testSpec.bytes);
        jqUnit.assertDeepEq("The raw MIDI bytes should have been correctly decoded into a messageSpec object.", testSpec.messageSpec, actual);
    });
};

flock.test.midi.decodingTests();
