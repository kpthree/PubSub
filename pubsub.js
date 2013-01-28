(function (name, global, definition) {
    "use strict";
    var commonJSModule = typeof module === "object" && typeof require === "function";
    if (commonJSModule) {
        console.log("commonJSModule");
        module.exports = definition(name, global);
    } else if (typeof define === 'function' && typeof define.amd  === 'object') {
        console.log("amd");
        define(definition);
    } else {
        console.log("global");
        global[name] = definition(name, global);
    }
}('PubSub', (typeof window !== 'undefined' && window) || this,
    function definition(name, global) {
        "use strict";
        var PubSub = {
                name: 'PubSub',
                version: 0.1
            },
            iLastToken = -1,
            iTimer = null,
            oSubscriptions = {},
            oSubscriberNameTopicMappings = {},
            oColacingQueue = {};

        function callSubscriberCallback(sTopic, sActualTopic, oData) {
            var oTokens = oSubscriptions[sTopic], token;
            if (!oTokens) {
                return;
            }
            for (token in oTokens) {
                if (oTokens.hasOwnProperty(token)) {
                    setTimeout(oTokens[token]["callback"].call(
                        oTokens[token]["context"],
                        sActualTopic, oData
                    ), 0);
                }
            }
        }

        function getPublisherFunction(sTopic, oData) {
            return function() {
                callSubscriberCallback(sTopic, sTopic, oData);
                var position = sTopic.lastIndexOf('.'), topic = null;
                while(position !== -1) {
                    topic = sTopic.substr(0, position);
                    position = topic.lastIndexOf('.');
                    topic = topic + ".*";
                    callSubscriberCallback(topic, sTopic, oData);
                }
                callSubscriberCallback("*", sTopic, oData);
            };
        }

        function flushCoalesceingQueue() {
            console.log("Colacing");
            var topic, fnPublisher;
            for (topic in oColacingQueue) {
                if (oColacingQueue.hasOwnProperty(topic)) { 
                    fnPublisher = getPublisherFunction(
                        topic, oColacingQueue[topic]
                    );
                    setTimeout(fnPublisher, 0);
                    delete oColacingQueue[topic];
                }
            }
            oColacingQueue = {};
        }

        function startColacing() {
            if (iTimer === null) {
                iTimer = setInterval(flushCoalesceingQueue, 4000);
            }
        }

        function stopColacing() {
            if (!!iTimer) {
                console.log("stop colacing");
                clearInterval(iTimer);
            }
        }

        /**
         *  PubSub.publish( message[, data][, coalesce] ) -> Boolean
         *  - message (String): The message to publish
         *  - data: The data to pass to subscribers
         *  - coalesce: boolean to indicate if multiple publish should be coalesced.
         *              Defaults to true
         *  Publishes to the topic, passing the data to it's subscribers
         **/
        PubSub.publish = function (sTopic, oData, bCoalesce) {
            startColacing();
            //setTimeout(function(){console.log('in setInterval');}, 0);
            //console.log('in setInterval out');
            // topic should always be string
            if (!sTopic || typeof sTopic !== "string") {
                throw new Error("You must provide a valid topic to publish.");
            }
            if (typeof bCoalesce === "undefined") {
                bCoalesce = true;
            }
            if (typeof bCoalesce !== "boolean") {
                throw new Error("Value for bCoalesce should be either true or false.");
            }
            var fnPublisher = getPublisherFunction(sTopic, oData);
            if (!bCoalesce) {
                // push it in browser's event loop
                setTimeout(fnPublisher, 0);
                //fnPublisher();
            } else {
                // add it to the colacing queue
                oColacingQueue[sTopic] = oData;
            }
        };

        /**
         *  PubSub.subscribe(sSubscriptionName, sTopic, oContext, fnCallback)
         *                   -> String
         *  - sSubscriptionName (String): The name of subscriber
         *  - sTopic: The topic to subscribe to
         *  - oContext: it will be 'this' when the callback is called
         *  - fnCallback: callback when there is a publish to the subscribed topic
         **/
        PubSub.subscribe = function (sSubscriptionName,
                                     sTopic,
                                     oContext,
                                     fnCallback) {
            startColacing();
            if (!sSubscriptionName || typeof sSubscriptionName !== "string") {
                throw new Error("Valid Subscription Name is required.");
            }
            if (!sTopic || typeof sTopic !== "string") {
                throw new Error("Valid Topic is required.");
            }
            if (!fnCallback || typeof fnCallback !== "function") {
                throw new Error("Valid callback is required.");
            }
            if (!oSubscriptions.hasOwnProperty(sTopic)) {
                oSubscriptions[sTopic] = {};
            }
            if (!oSubscriberNameTopicMappings.hasOwnProperty(sSubscriptionName)) {
                oSubscriberNameTopicMappings[sSubscriptionName] = [];
            }
            var token = String(++iLastToken);
            oSubscriptions[sTopic][iLastToken] = {
                "callback": fnCallback,
                "context": oContext
            };
            oSubscriberNameTopicMappings[sSubscriptionName].push({
                "topic": sTopic,
                "token": token
            });
            return token;
        };

        return PubSub;
    }
));
