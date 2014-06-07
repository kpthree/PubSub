describe("PubSub", function() {
  
    beforeEach(function() {
        pubSubTestObj = PubSub;
    });

    afterEach(function() {
        pubSubTestObj = null;
    });

    it("should be named as PubSub", function() {
        expect(pubSubTestObj.name).toBe("PubSub");
    });
});