describe("PubSub.publish (coalesce = true)", function() {
    
    beforeEach(function() {
        pubSubTestObj = PubSub;
        coalesceQFlushingInterval = 5000;
        timerCallback = jasmine.createSpy('timerCallback');
        universalCallback = jasmine.createSpy('universalCallback');
        nonUniversalCallback = jasmine.createSpy('nonUniversalCallback');
        jasmine.Clock.useMock();
    });

    afterEach(function() {
        pubSubTestObj = null;
        fnCallback = null;
    });

    describe("PubSub.publish non-hierarchical)", function() {
        it("should call the subscriber once when a topic is published multiple times",
            function() {
                var data = "test data from the Publisher", callCount = 0,
                topic = "coalesced-topic", updatedData = data + " updated",
                token = pubSubTestObj.subscribe("test-subscription",
                                                topic,
                                                null,
                                                timerCallback);
                expect(token).toBeString();
                // first publish
                pubSubTestObj.publish(topic, data);
                jasmine.Clock.tick(Math.min(coalesceQFlushingInterval - 2000, 50));
                // second publish before the actual publish call
                pubSubTestObj.publish(topic, updatedData);
                expect(timerCallback.callCount).toBe(callCount);
                expect(timerCallback).not.toHaveBeenCalled();

                jasmine.Clock.tick(coalesceQFlushingInterval + 1);
                expect(timerCallback.callCount).toBe(++callCount);
                expect(timerCallback).toHaveBeenCalled();
            }
        );
        it("should call the subscriber once when a topic is published " +
           "multiple times only with the latest data",
            function() {
                var data = "test data from the Publisher", callCount = 0,
                topic = "coalesced-topic", updatedData = data + " updated",
                token = pubSubTestObj.subscribe("test-subscription",
                                                topic,
                                                null,
                                                timerCallback);
                expect(token).toBeString();
                // first publish
                pubSubTestObj.publish(topic, data);
                jasmine.Clock.tick(Math.min(coalesceQFlushingInterval - 2000, 50));
                // second publish before the actual publish call
                pubSubTestObj.publish(topic, updatedData);
                expect(timerCallback).not.toHaveBeenCalled();

                jasmine.Clock.tick(coalesceQFlushingInterval + 1);
                expect(timerCallback).not.toHaveBeenCalledWith(topic, data);
                expect(timerCallback).toHaveBeenCalledWith(topic, updatedData);
            }
        );
    });
    describe("PubSub.publish hierarchical)", function() {
        it("should call only the subscribes which are subscribed with " +
           " hierarchical notation", function(){
            var token1 = pubSubTestObj.subscribe("test-subscription",
                                                 "ramesh.suresh.mukesh",
                                                 null,
                                                 timerCallback),
            token2 = pubSubTestObj.subscribe("test2", "ramesh.suresh.*",
                                             null, universalCallback),
            token3 = pubSubTestObj.subscribe("test3", "ramesh.suresh",
                                             null, universalCallback),
            data = "hema rekha jaya", topic = "ramesh.suresh.mukesh";
            pubSubTestObj.publish(topic, data);
            jasmine.Clock.tick(Math.min(coalesceQFlushingInterval - 2000, 50));
            expect(timerCallback).not.toHaveBeenCalled();
            expect(universalCallback).not.toHaveBeenCalled();
            expect(nonUniversalCallback).not.toHaveBeenCalled();
            jasmine.Clock.tick(coalesceQFlushingInterval + 1);
            expect(timerCallback).toHaveBeenCalled();
            expect(universalCallback).toHaveBeenCalled();
            
            expect(timerCallback).toHaveBeenCalledWith(topic, data);
            expect(universalCallback).toHaveBeenCalledWith(topic, data);
            expect(nonUniversalCallback).not.toHaveBeenCalled();
        });
        it("should call only the subscribes which are subscribed with " +
           " hierarchical notation with the latest data", function(){
            var token1 = pubSubTestObj.subscribe("test-subscription",
                                                 "ramesh.suresh.mukesh",
                                                 null,
                                                 timerCallback),
            token2 = pubSubTestObj.subscribe("test2", "ramesh.suresh.*",
                                             null, universalCallback),
            data = "hema rekha jaya", updatedData = data + " aur sushma",
            topic = "ramesh.suresh.mukesh";
            pubSubTestObj.publish(topic, data);
            jasmine.Clock.tick(Math.min(coalesceQFlushingInterval - 2000, 50));
            pubSubTestObj.publish(topic, updatedData);
            jasmine.Clock.tick(coalesceQFlushingInterval + 1);
            
            expect(timerCallback).toHaveBeenCalledWith(topic, updatedData);
            expect(universalCallback).toHaveBeenCalledWith(topic, updatedData);
        });
        it("should call only the subscribes which are subscribed with " +
           " hierarchical notation with correct callback", function(){
            var token1 = pubSubTestObj.subscribe("test-subscription",
                                                 "ramesh.suresh.mukesh",
                                                 {"faata":"faat"},
                                                 timerCallback),
            token2 = pubSubTestObj.subscribe("test2", "ramesh.suresh.*",
                                             null, universalCallback),
            data = "hema rekha jaya", updatedData = data + " aur sushma",
            topic = "ramesh.suresh.mukesh";
            pubSubTestObj.publish(topic, data);
            jasmine.Clock.tick(Math.min(coalesceQFlushingInterval - 2000, 50));
            pubSubTestObj.publish(topic, updatedData);
            jasmine.Clock.tick(coalesceQFlushingInterval + 1);
            
            expect(timerCallback).toHaveBeenCalledWith(topic, updatedData);
            expect(universalCallback).toHaveBeenCalledWith(topic, updatedData);
        });
    });
});
