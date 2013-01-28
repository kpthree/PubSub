describe("PubSub.publish (coalesce = false)", function() {
    
    beforeEach(function() {
        jasmine.Clock.useMock();
        pubSubTestObj = PubSub;
        callPublisher = function(topic, data, coalesce) {
            return function() {
                pubSubTestObj.publish(topic, data, coalesce);
            }
        };
        topicRequired = new Error("You must provide a valid topic to publish.");
        validCoalesce = new Error("Value for bCoalesce should be either true or false.");
    });

    afterEach(function() {
        pubSubTestObj = null;
        callPublisher = null;
        topicRequired = null;
        validCoalesce = null;
        fnCallback = null;
    });

    it("should throw an exception as the topic is not string", function() {
        expect(callPublisher(undefined, "no data")).
            toThrow(topicRequired);
    });

    it("should throw an exception when bCoalesce is not boolean",
        function() {
            expect(callPublisher("topic", "no data", 1)).
                toThrow(validCoalesce);
            expect(callPublisher("topic", "no data", "1")).
                toThrow(validCoalesce);
            expect(callPublisher("topic", "no data", {})).
                toThrow(validCoalesce);
        }
    );

    describe("PubSub.publish non-hierarchical)", function() {
        it("should call the subscriber when a topic is published multiple times",
            function() {
                var data = "test data from the Publisher", itr = 10, callCount = 0,
                token = pubSubTestObj.subscribe("test-subscription",
                                                "test-topic",
                                                null,
                                                fnCallback.spy1.spy);
                expect(token).toBeString();
                expect(fnCallback.spy1.getCount()).toBe(callCount);
                pubSubTestObj.publish("test-topic", data, false);
                jasmine.Clock.tick(1);
                expect(fnCallback.spy1.getCount()).toBe(++callCount);
                expect(fnCallback.spy1.getData()).toBe(data);
                for (var i = 0; i < itr; i++) {
                    pubSubTestObj.publish("test-topic", data, false);
                    callCount++;
                }
                // since all the callbacks are in browser's event loop
                // none might have called.
                expect(fnCallback.spy1.getCount()).toBe(callCount - itr);
                // make the browser free by waiting for 1ms
                jasmine.Clock.tick(1);
                // all the callbacks should have been called by now
                expect(fnCallback.spy1.getCount()).toBe(callCount);
            }
        );
        it("should call the all the subscriber when a topic is published multiple times",
            function() {
                var data = "test data from the Publisher",
                itr = 10, callCount = 0,
                token1 = pubSubTestObj.subscribe("test-subscription-1",
                                                 "test-topic",
                                                 null,
                                                 fnCallback.spy1.spy),
                token2 = pubSubTestObj.subscribe("test-subscription-2",
                                                 "test-topic",
                                                 null,
                                                 fnCallback.spy2.spy);
                expect(token1).toBeString();
                expect(token2).toBeString();
                expect(fnCallback.spy1.getCount()).toBe(callCount);
                expect(fnCallback.spy2.getCount()).toBe(callCount);
                // Publish to test-topic
                pubSubTestObj.publish("test-topic", data, false);
                jasmine.Clock.tick(1);

                expect(fnCallback.spy1.getCount()).toBe(++callCount);
                expect(fnCallback.spy2.getCount()).toBe(callCount);
                expect(fnCallback.spy1.getData()).toBe(data);
                expect(fnCallback.spy2.getData()).toBe(data);
                
                for (var i = 0; i < itr; i++) {
                    pubSubTestObj.publish("test-topic", data, false);
                    callCount++;
                }
                // since all the callbacks are in browser's event loop
                // none might have called.
                expect(fnCallback.spy1.getCount()).toBe(callCount - itr);
                expect(fnCallback.spy2.getCount()).toBe(callCount - itr);
                // make the browser free by waiting for 1ms
                jasmine.Clock.tick(1);
                // all the callbacks should have been called by now
                expect(fnCallback.spy1.getCount()).toBe(callCount);
                expect(fnCallback.spy2.getCount()).toBe(callCount);
            }
        );
        it("should call the subscriber with the data which was published",
            function() {
                var data = "test data from the Publisher",
                itr = 10, callCount = 0,
                token1 = pubSubTestObj.subscribe("test-subscription-1",
                                                 "test-topic",
                                                 null,
                                                 fnCallback.spy1.spy);
                expect(token1).toBeString();
                expect(fnCallback.spy1.getCount()).toBe(callCount);
                // Publish to test-topic
                pubSubTestObj.publish("test-topic", data, false);
                jasmine.Clock.tick(1);

                expect(fnCallback.spy1.getCount()).toBe(++callCount);
                
                for (var i = 0; i < itr; i++) {
                    pubSubTestObj.publish("test-topic", data + "-" + i, false);
                    jasmine.Clock.tick(1);
                    expect(fnCallback.spy1.getData()).toBe(data + "-" + i);
                    callCount++;
                }
                // all the callbacks should have been called by now
                expect(fnCallback.spy1.getCount()).toBe(callCount);
            }
        );
        it("should call the subscriber with the correct topic name",
            function() {
                var data = "test data from the Publisher",
                itr = 10, callCount = 0,
                token1 = pubSubTestObj.subscribe("test-subscription-1",
                                                 "test-topic",
                                                 null,
                                                 fnCallback.spy1.spy);
                expect(token1).toBeString();
                expect(fnCallback.spy1.getCount()).toBe(callCount);
                // Publish to test-topic
                pubSubTestObj.publish("test-topic", data, false);
                jasmine.Clock.tick(1);
                expect(fnCallback.spy1.getTopic()).toBe("test-topic");
            }
        );
        it("should call the subscriber with the correct context which was specified",
            function() {
                var data = "test data from the Publisher", itr = 10,
                callCount = 0, context = {"context_data": "Sample Context"},
                token1 = pubSubTestObj.subscribe("test-subscription-1",
                                                 "test-topic",
                                                 context,
                                                 fnCallback.spy1.spy);
                expect(token1).toBeString();
                expect(fnCallback.spy1.getCount()).toBe(callCount);
                // Publish to test-topic
                pubSubTestObj.publish("test-topic", data, false);
                jasmine.Clock.tick(1);
                expect(fnCallback.spy1.getContext()).toBe(context);
            }
        );
    });
    describe("PubSub.publish hierarchical)", function() {
        it("should call all the subscribers in the hierarchy", function() {
            var token1 = pubSubTestObj.subscribe("test-subscription",
                                                 "foo.bar.faa",
                                                 null,
                                                 fnCallback.spy1.spy),
            token2 = pubSubTestObj.subscribe("test-subscription",
                                             "foo.bar.*",
                                             null,
                                             fnCallback.spy1.spy),
            token3 = pubSubTestObj.subscribe("test-subscription",
                                             "foo.*",
                                             null,
                                             fnCallback.spy1.spy),
            data = "hierarchy publishing test", callCount = 0;
            expect(token1).toBeString();
            expect(token2).toBeString();
            expect(fnCallback.spy1.getCount()).toBe(callCount);
            // Publish to foo.bar.faa
            pubSubTestObj.publish("foo.bar.faa", data, false);
            jasmine.Clock.tick(1);
            // the Spy1.spy should be called twice
            callCount = callCount + 3;
            expect(fnCallback.spy1.getCount()).toBe(callCount);
            expect(fnCallback.spy1.getData()).toBe(data);
        });
        it("should not call the subscribers which are subscribed without hierarchy notation",
            function() {
                var token1 = pubSubTestObj.subscribe("test-subscription",
                                                     "foo.bar.faa",
                                                     null,
                                                     fnCallback.spy1.spy),
                token2 = pubSubTestObj.subscribe("test-subscription",
                                                 "foo.bar",
                                                 null,
                                                 fnCallback.spy2.spy),
                data = "non-hierarchy publishing test", callCount = 0;
                expect(token1).toBeString();
                expect(token2).toBeString();
                expect(fnCallback.spy1.getCount()).toBe(callCount);
                // Publish to foo.bar.faa
                pubSubTestObj.publish("foo.bar.faa", data, false);
                jasmine.Clock.tick(1);
                // the Spy1.spy should be called twice
                expect(fnCallback.spy1.getCount()).toBe(++callCount);
                expect(fnCallback.spy2.getData()).toBeNull();
                expect(fnCallback.spy2.getCount()).toBe(0);
            }
        );
        it("should call the subscribers which are subscribed with global hierarchy notation",
            function() {
                var token1 = pubSubTestObj.subscribe("test-subscription",
                                                     "par.foo.bar.faa",
                                                     null,
                                                     fnCallback.spy1.spy),
                token2 = pubSubTestObj.subscribe("test-subscription",
                                                 "*",
                                                 null,
                                                 fnCallback.spy2.spy),
                data = "non-hierarchy publishing test", callCount = 0;
                expect(token1).toBeString();
                expect(token2).toBeString();
                expect(fnCallback.spy1.getCount()).toBe(callCount);
                // Publish to foo.bar.faa
                pubSubTestObj.publish("par.foo.bar.faa", data, false);
                jasmine.Clock.tick(1);
                expect(fnCallback.spy1.getCount()).toBe(1);
                expect(fnCallback.spy2.getCount()).toBe(1);
                expect(fnCallback.spy2.getTopic()).toBe("par.foo.bar.faa");

                pubSubTestObj.publish("par.foo", data, false);
                jasmine.Clock.tick(1);
                expect(fnCallback.spy1.getCount()).toBe(1);
                expect(fnCallback.spy2.getCount()).toBe(2);
                expect(fnCallback.spy2.getTopic()).toBe("par.foo");

                pubSubTestObj.publish("foo.bar", data, false);
                jasmine.Clock.tick(1);
                expect(fnCallback.spy1.getCount()).toBe(1);
                expect(fnCallback.spy2.getCount()).toBe(3);
                expect(fnCallback.spy2.getTopic()).toBe("foo.bar");
                
                pubSubTestObj.publish("par.foo.faa", data, false);
                jasmine.Clock.tick(1);
                expect(fnCallback.spy1.getCount()).toBe(1);
                expect(fnCallback.spy2.getCount()).toBe(4);
                expect(fnCallback.spy2.getTopic()).toBe("par.foo.faa");
                
                pubSubTestObj.publish("foo", data, false);
                jasmine.Clock.tick(1);
                expect(fnCallback.spy1.getCount()).toBe(1);
                expect(fnCallback.spy2.getCount()).toBe(5);
                expect(fnCallback.spy2.getTopic()).toBe("foo"); 
            }
        );
    });
    
});
