var public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/1M8L-O9UQC0CbRMbKtTsfyYKBqJZekkpbA9VE8CQ20cY/pubhtml";

// FIXME: create edEvent object

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


var sourceUrl = "http://spreadsheets.google.com/feeds/list/1M8L-O9UQC0CbRMbKtTsfyYKBqJZekkpbA9VE8CQ20cY/od6/public/values?alt=json";

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

$.ajax({
  url: sourceUrl,
  jsonpCallback: 'jsonCallback',
  contentType: "application/json",
  dataType: 'jsonp',
  error: function(jqXHR, textStatus, errorThrown) {
    console.log("Fail to load Google spreadsheet data...");
    console.log(jqXHR);
  },
  success: function(data) {
    spreadsheetData = data;
    mapGData(spreadsheetData);
  },
  complete: function() {
    console.log("Finish loading spreadsheet data!");
  }
});

function mapGData(data) {
  var gEvents = data.feed.entry;
  gEvents.forEach(function(gEvent){
    var vizEvent = {};
    // FIXME: make sure things are using the right type
    vizEvent["id"] = vizAllEvents.length + 1; // assign real id for future reference, starts from 1
    vizEvent["tempId"] = gEvent[ columnNames.tempId ][dataKey];
    vizEvent["eventName"] = gEvent[ columnNames.eventName ][dataKey];
    vizEvent["tier"] = gEvent[ columnNames.tier ][dataKey]; // parseInt?
    vizEvent["channel"] = gEvent[ columnNames.channel ][dataKey];
    vizEvent["startDate"] = new Date( gEvent[ columnNames.startDate ][dataKey] );
    vizEvent["endDate"] = new Date( gEvent[ columnNames.endDate ][dataKey] );
    vizAllEvents.push(vizEvent);
    vizEventsByTier[vizEvent["tier"]].push( vizEvent );
  });
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
    var selected = vizAllEvents[(id-1)];
    // update content
    $("#event-title").text(selected.eventName);
    for( key in selected ) {
      var listItem = "";
      if ( key == "channel") {
        listItem += "<li><b class='label'>" + key + "</b><br />";
        var channels = selected[key].split(",");
        for (var i=0; i<channels.length; i++) {
          listItem += channels[i] + "</ br>";
        }
        listItem += "</li>";
      } else {
        listItem =  "<li>" +
                     "<b class='label'>" + key + "</b>" + selected[key] +
                    "</li>";
      }
      $("#event-details").append(listItem);
    }
  });
}

