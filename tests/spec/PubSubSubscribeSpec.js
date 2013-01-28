describe("PubSub.subscribe", function() {
    
    beforeEach(function() {
        pubSubTestObj = PubSub;
        callSubscribe = function(sN, topic, context, cb) {
            return function() {
                pubSubTestObj.subscribe(sN, topic, context, cb);
            }
        };
        subNameRequired = new Error("Valid Subscription Name is required.");
        topicNameRequired = new Error("Valid Topic is required.");
        callbackRequired = new Error("Valid callback is required.");
    });

    afterEach(function() {
        pubSubTestObj = null;
        callSubscribe = null;
        subNameRequired = null;
        topicNameRequired = null;
    });

    it("should throw an exception when subscription name is not mentioned",
        function() {
            expect(callSubscribe()).toThrow(subNameRequired);
        }
    );

    it("should throw an exception when subscription name is blank",
        function() {
            expect(callSubscribe("")).toThrow(subNameRequired);
        }
    );

    it("should throw an exception when subscription name is not string",
        function() {
            expect(callSubscribe(1)).toThrow(subNameRequired);
            expect(callSubscribe({})).toThrow(subNameRequired);
        }
    );

    it("should not throw an exception when subscription name is present",
        function() {
            expect(callSubscribe("test-subscription")).
                not.toThrow(subNameRequired);
        }
    );

    // Tests for callback
    it("should throw an exception when callback is not mentioned",
        function() {
            expect(callSubscribe("test-subscription", "test-topic", null)).
                toThrow(callbackRequired);
        }
    );

    it("should throw an exception when callback is blank",
        function() {
            expect(callSubscribe("test-subscription", "test-topic", null, "")).
                toThrow(callbackRequired);
        }
    );

    it("should throw an exception when callback is not function",
        function() {
            expect(callSubscribe("test-subscription", "topic", null, 1)).
                toThrow(callbackRequired);
            expect(callSubscribe("test-subscription", "topic", null, {})).
                toThrow(callbackRequired);
        }
    );

    it("should not throw an exception when callback is present",
        function() {
            expect(
                callSubscribe(
                    "test-subscription",
                    "test-topic",
                    null,
                    function (){}
                )
            ).not.toThrow(callbackRequired);
        }
    );

    // Tests for Topic
    it("should throw an exception when topic name is not mentioned",
        function() {
            expect(callSubscribe("test-subscription")).
                toThrow(topicNameRequired);
        }
    );

    it("should throw an exception when topic name is blank",
        function() {
            expect(callSubscribe("test-subscription", "")).
                toThrow(topicNameRequired);
        }
    );

    it("should throw an exception when topic name is not string",
        function() {
            expect(callSubscribe("test-subscription", 1)).
                toThrow(topicNameRequired);
            expect(callSubscribe("test-subscription", {})).
                toThrow(topicNameRequired);
        }
    );

    it("should not throw an exception when topic name is present",
        function() {
            expect(callSubscribe("test-subscription", "test-topic")).
                not.toThrow(topicNameRequired);
        }
    );

    it("should return token as string", function() {
        var fn = function(){},
        token = pubSubTestObj.subscribe("test-sn", "test-topic", null, fn);
        expect(token).toBeString();
    });

    it("should return new token for several subscriptions with same function",
        function() {
            var fn = function(){},
            tokens = [], itr = 10;
            for (i = 0; i < itr; i++) {
                tokens.push(
                    pubSubTestObj.subscribe(
                        "test-sn", "test-topic-" + i, null, fn
                    )
                );
            }
            expect(tokens).toBeUnique();
    });

    it("should return new token for several subscriptions with different function",
        function() {
            var fn = function(value) {
                return function() {
                    return value;
                }
            },
            tokens = [], itr = 10;
            for (i = 0; i < itr; i++) {
                tokens.push(
                    pubSubTestObj.subscribe(
                        "test-sn", "test-topic", null, fn(i)
                    )
                );
            }
            expect(tokens).toBeUnique();
    });
});