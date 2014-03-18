## PubSub

PubSub is a dependency free library with coalescing and Hierarchical publishing

## Examples

### Basic example without coalescing
```javascript
// Create a subscriber callback (listener) to listen
// to update events on table grid
var fnUpdateDataStore = function(topic, data) {
    console.log(topic);
    console.log(data);
}
// Subscribe to a save event of table grid
var saveToken = PubSub.subscribe("TableStore", // name
                                 "widgets.table-grid.save", // topic
                                 null, // context
                                 fnUpdateDataStore); // callback

// Publish with updated data when the user hits save
// of the table grid widget
PubSub.publish("widgets.table-grid.save", // topic
               { updatedRow: { name:"Charlie C", age: 32 }}, // data
               false); // coalesce

// console.log: widgets.table-grid.save
// console.log: {updatedRow: {age: 32, name: "Charlie C"}}
```
### Basic example with coalescing
```javascript
// Create a subscriber callback (listener) to listen
// to scroll event on table grid
var fnLoadMoreData = function(topic, data) {
    console.log(topic);
    console.log(data);
}
// Subscribe to a scroll event of table grid
var scrollToken = PubSub.subscribe("TableStore",
                                   "widgets.table-grid.scroll",
                                   null,
                                   fnLoadMoreData);

// Publish with updated scroll position when the user scroll
PubSub.publish("widgets.table-grid.scroll",
               { scrollPos: { top: 400}},
               true);
PubSub.publish("widgets.table-grid.scroll",
               { scrollPos: { top: 458}},
               true);
PubSub.publish("widgets.table-grid.scroll",
               { scrollPos: { top: 497}},
               true);
// Since scroll events are very fast occurring events,
// the interest is always in the final position of scrollbar

// console.log: widgets.table-grid.scroll
// console.log: { scrollPos: { top: 497}}
// note: subscriber is called only once (if published within coalescing interval. Default: 4000 ms)
```

### Hierarchical publishing
```javascript
// Create a subscriber callback (listener) to listen
// to update events on table grid
var fnUpdateTableLayout = function(topic, data) {
    console.log("Table layout updated");
    console.log(topic);
    console.log(data);
}
var fnColumnRemove = function(topic, data) {
    console.log("Column removed");
    console.log(topic);
    console.log(data);
}
var fnRowRemove = function(topic, data) {
    console.log("Row removed");
    console.log(topic);
    console.log(data);
}
// Subscribe to row level topics of table grid
var rToken = PubSub.subscribe("TableView",
                              "widgets.table-grid.view.row-rm",
                              null,
                              fnRowRemove);
// Subscribe to column level topics of table grid
var cToken = PubSub.subscribe("TableView",
                              "widgets.table-grid.view.column-rm",
                              null,
                              fnColumnRemove);
// Subscribe to any view updates on table grid
var tToken = PubSub.subscribe("TableView",
                              "widgets.table-grid.view.*", // note the asterisk
                              null,
                              fnUpdateTableLayout);

// Publish when a row is removed
PubSub.publish("widgets.table-grid.view.row-rm",
               { row: { id: 1}},
               false);
// console.log: Row removed
// console.log: widgets.table-grid.view.row-rm
// console.log: { row: { id: 1}}
// console.log: Table layout updated
// console.log: widgets.table-grid.view.row-rm
// console.log: { row: { id: 1}}

// Publish when a column is removed
PubSub.publish("widgets.table-grid.view.column-rm",
               { column: { id: 3}},
               false);
// console.log: Column removed
// console.log: widgets.table-grid.view.column-rm
// console.log: { column: { id: 3}}
// console.log: Table layout updated
// console.log: widgets.table-grid.view.column-rm
// console.log: { column: { id: 3}}

// so, lets say you want to subscribe to all the topic under widgets
var fnWidgetUpdate = function() {
    console.log("Widget updated");
}
var gWidgetToken = PubSub.subscribe("Widgets",
                                    "widgets.*",
                                    null,
                                    fnWidgetUpdate);
PubSub.publish("widgets.table-grid.view",
               "view change 1",
               false);
PubSub.publish("widgets.table-grid.view",
               "view change 2",
               false);
PubSub.publish("widgets.table-grid",
               "table grid push",
               false);
PubSub.publish("widgets",
               "widgetssss push",
               false);
// console.log: Widget updated
// console.log: Widget updated
// console.log: Widget updated
// note: only 3 calls to fnWidgetUpdate as we have subscribed
//       to all topics under widgets
```

### Subscribing with context
```javascript
// Create a subscriber callback (listener) to listen
// to update events on table grid
var fnUpdateTableView = function(topic, data) {
    console.log("Width: " + this.w);
    console.log("Height: " + this.h);
}
// Subscribe to a save event of table grid
var token = PubSub.subscribe("TableStore",
                             "widgets.table-grid.view",
                             {w: 300, h: 500, t: 30, l: 60}, // can be table grid object
                             fnUpdateTableView);

PubSub.publish("widgets.table-grid.view",
               "table refreshed",
               false); 

// console.log: Width: 300
// console.log: Height: 500

```
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/kpthree/pubsub/trend.png)](https://bitdeli.com/free "Trends")


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/kpthree/pubsub/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

