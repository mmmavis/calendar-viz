// https://spreadsheets.google.com/feeds/list/1M8L-O9UQC0CbRMbKtTsfyYKBqJZekkpbA9VE8CQ20cY/od6/public/values?alt=json-in-script&callback=x


// $.getJSON("http://cors.io/spreadsheets.google.com/feeds/list/1M8L-O9UQC0CbRMbKtTsfyYKBqJZekkpbA9VE8CQ20cY/od6/public/values?alt=json", function(data) {
//   console.log(data.feed);
//   // first row content
//   console.log(data.feed.entry[5].content['$t']);
//   //first row "event" column
//   // console.log(data.feed.entry[0]['gsx$event']['$t']);

//   console.log("==============================");
// });


// will have to put this in .env so it makes updating easier
var colKeyPrefix = "gsx$";
var dataKey = "$t";
var columnNames = {
  tempId: colKeyPrefix + "tempid",
  eventName: colKeyPrefix + "event",
  tier: colKeyPrefix + "highesttier",
  channel: colKeyPrefix + "channel",
  startDate: colKeyPrefix + "startdate",
  endDate: colKeyPrefix + "enddate"
};


var useMe = "http://spreadsheets.google.com/feeds/list/1M8L-O9UQC0CbRMbKtTsfyYKBqJZekkpbA9VE8CQ20cY/od6/public/values?alt=json";
var useMe2 = "http://spreadsheets.google.com/feeds/list/1M8L-O9UQC0CbRMbKtTsfyYKBqJZekkpbA9VE8CQ20cY/0/public/basic?alt=json&callback=myFunc";

var spreadsheetData = {};
var vizAllEvents = [];
var vizEventsByTier = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: []
};

$.getJSON(useMe, function(data) {
  spreadsheetData = data;
  // console.log(spreadsheetData);
  // console.log(data.feed.entry[5].content['$t']);
  //first row "event" column
  // console.log(data.feed.entry[0]['gsx$event']['$t']);
  mapGData(spreadsheetData);

});

function mapGData(data) {
  var gEvents = data.feed.entry;
  gEvents.forEach(function(gEvent){
    var vizEvent = {};
    // make sure things are using the right type
    vizEvent["id"] = vizAllEvents.length + 1; // assign real id for future reference, starts from 1
    vizEvent["tempId"] = gEvent[ columnNames.tempId ][dataKey];
    vizEvent["eventName"] = gEvent[ columnNames.eventName ][dataKey];
    vizEvent["tier"] = gEvent[ columnNames.tier ][dataKey]; // parseInt?
    vizEvent["channel"] = gEvent[ columnNames.channel ][dataKey];
    vizEvent["startDate"] = new Date( gEvent[ columnNames.startDate ][dataKey] );
    vizEvent["endDate"] = new Date( gEvent[ columnNames.endDate ][dataKey] );
    vizAllEvents.push(vizEvent);
    vizEventsByTier[vizEvent["tier"]].push( vizEvent );
    console.log("=====");
    // drawRow(vizEvent);
  });
  console.log(vizAllEvents);
  buildTable();
}


function buildTable() {
  drawHeader();
  for ( tier in vizEventsByTier ) {
    var tierGroup = vizEventsByTier[tier];
    tierGroup.forEach(function(theEvent){
      drawRow(theEvent);
  });
  }
}


function drawHeader() {
  $("#calendar-viz thead").append("<tr>"+
                                        "<td>ID</td>" +
                                        "<td>tempID</td>" +
                                        "<td>eventName</td>" +
                                        "<td>tier</td>" +
                                        // "<td>channel</td>" +
                                        "<td>startDate</td>" +
                                        "<td>endDate</td>" +
                                    "</tr>");
}


function drawRow(theEvent) {
  $("#calendar-viz tbody").append("<tr>"+
                                        "<td>"+ theEvent["id"] +"</td>" +
                                        "<td>"+ theEvent["tempId"] +"</td>" +
                                        "<td>"+ theEvent["eventName"] +"</td>" +
                                        "<td>"+ theEvent["tier"] +"</td>" +
                                        // "<td>"+ theEvent["channel"] +"</td>" +
                                        "<td>"+ theEvent["startDate"] +"</td>" +
                                        "<td>"+ theEvent["endDate"] +"</td>" +
                                    "</tr>");
}
