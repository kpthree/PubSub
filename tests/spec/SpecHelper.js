beforeEach(function () {
    this.addMatchers({
        toBeObject: function () {
            return this.actual !== null && typeof(this.actual) === 'object';
        },
        toBeString: function () {
            return typeof(this.actual) === 'string';
        },
        toBeNumber: function () {
            return !isNaN(parseFloat(this.actual)) && typeof this.actual !== 'string';
        },
        toBeFunction: function () {
            return typeof(this.actual) === 'function';
        },
        toBeUnique: function () {
            var inputArr = this.actual;
            var valuesSoFar = {};
            for (var i = 0; i < inputArr.length; ++i) {
                var value = inputArr[i];
                if (Object.prototype.hasOwnProperty.call(valuesSoFar, value)) {
                   return false;
                }
                valuesSoFar[value] = true;
            }
            return true;
        },
        toExist: function () {
            return this.actual !== null;
        },
        toBeNull: function () {
            return this.actual == null;
        }
    });
    fnCallback = (function () {
        var spy1Count = 0, spy1Topic = null, spy1Data = null,
        spy2Count = 0, spy2Topic = null, spy2Data = null,
        spy1Context = null, spy2Context = null;
        return {
            spy1: {
                getCount: function() {return spy1Count;},
                getTopic: function() {return spy1Topic;},
                getData: function() {return spy1Data;},
                getContext: function() {return spy1Context;},
                spy: function(t, d) {
                    spy1Context = this;
                    spy1Count++;
                    spy1Topic = t;
                    spy1Data = d;
                }
            },
            spy2: {
                getCount: function() {return spy2Count;},
                getTopic: function() {return spy2Topic;},
                getData: function() {return spy2Data;},
                getContext: function() {return spy2Context;},
                spy: function(t, d) {
                    spy2Context = this;
                    spy2Count++;
                    spy2Topic = t;
                    spy2Data = d;
                }
            }
        }
    })();
});