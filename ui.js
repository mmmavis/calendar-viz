var public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/1M8L-O9UQC0CbRMbKtTsfyYKBqJZekkpbA9VE8CQ20cY/pubhtml";

// TODO: create edEvent object

var monthAbbr = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

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


var viz = $("#calendar-viz");
var vizTier = $("#calendar-viz-tier");

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
      drawRow(theEvent, tier);
    });
    drawTierLabel(tier, tierGroup);
    drawTierTable(tier, tierGroup);
  }
  addEventHandler();
}

function drawTierTable(tier,tierGroup) {
  tierGroup.forEach(function(theEvent, i){
    if ( i == 0 ) {
      vizTier.find("tbody").append("<tr><td rowspan=" + tierGroup.length + ">" + tier + "</td></tr>");
    }else {
      vizTier.find("tbody").append("<tr></tr>");
    }
  });
}

function drawHeader() {
  // FIXME: make use of <col>
  var colGroupHtml = "";
  var headerHtml = "";
  // build colGroup and headerHtml
  colGroupHtml += "<col class='tier'></col>"
  headerHtml = "<th>Tier</th>";
  for (var i=0; i<12; i++) {
    colGroupHtml += "<col class='month " + monthAbbr[i] + "'></col>";
    headerHtml += "<th>" + monthAbbr[i] + "</th>";
  }
  colGroupHtml += "<col class='eventCol'></col>";
  headerHtml += "<th class='eventName'>Event</th>";
  // insert to DOM
  viz.find("thead").before("<colgroup>"+ colGroupHtml + "</colgroup>")
                   .append("<tr>"+ headerHtml + "</tr>");
}


function drawRow(theEvent, tier) {
  var rowHtml = "";
  var month = theEvent.startDate.getMonth(); // index starts from 0
  // find and mark event month slot
  for (var i=0; i<12; i++) {
    if ( i == month ) {
      rowHtml += "<td class='month marked'><div class='dot'></div></td>"
    }else {
      rowHtml += "<td class='month'></td>";
    }
  }
  // disply event name
  rowHtml += "<td>"+ theEvent["eventName"] +"</td>";
  viz.find("tbody").append("<tr data-id=" +  theEvent.id + " data-tier=" + tier + ">" +
                                        rowHtml +
                                  "</tr>");
}

function drawTierLabel(tier,tierGroup) {
  console.log( tier );
  console.log(tierGroup.length);
  viz.find("tr[data-tier="+ tier +"]").prepend("<td class='tierLabel'>"+tier+"</td>");
  viz.find("tr[data-tier="+ tier +"]:last").addClass("tier-divider");
}



// ==================

function addEventHandler() {
  // show Event description
  $(".dot").click(function(event){
    // reset previously selected
    $("#description-box #event-details").html("");
    viz.find("tr[data-id].selected").removeClass("selected");
    // get currently selected Event
    var id = $(this).parents("tr[data-id]").addClass("selected").attr("data-id");
    var eventSelected = vizAllEvents[(id-1)];
    // update content
    $("#event-title").text(eventSelected.eventName);
    for( key in eventSelected ) {
      $("#event-details").append( "<li>" +
                                     "<b class='label'>" + key + "</b>" + eventSelected[key] +
                                  "</li>");
    }
  });
}

