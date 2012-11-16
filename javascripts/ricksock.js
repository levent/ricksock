(function($){ 
  $.fn.digits = function(){ 
    return this.each(function(){ 
      $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
    })
  }
})(jQuery);

$(document).ready(function(){

  // This is a cosm user level GET api key
  var api_key = "LLfnk2zkkn7YUTphaX-D1e-EYAySAKxpOWF5RUQzVm5TRT0g";
  var counter = 0;
  var average = 0;
  var rate = 1;
  var date = new Date;
  var stop = false;
  var tv = 2;

  var graphs = [];
  var datapoints = [];

  function createGraph(ds) {
    var datapoint = $.map(ds.datapoints, function(datapoint) {
      return {
        x : Math.floor(Date.parse(datapoint.at) / 1000),
        y : Number(datapoint.value)
      }
    });
    datapoints.push(datapoint)
    var graphId = 'graph-' + graphs.length;
    $('<div id="' + graphId + '"></div>').appendTo($('#charts'));
    var graph = new Rickshaw.Graph({
      element: document.getElementById(graphId),
      width: 400,
      height: 200,
      renderer: 'line',
      max: 100,
      stroke: true,
      series: [{
        color: 'steelblue',
        data: datapoint
      }]
    });
    graphs.push(graph);
    graph.render();
  }

  function createStackedGraph(datastreams) {
    var palette = new Rickshaw.Color.Palette( { scheme: 'spectrum14' } );
    var series = [];
    $.map(datastreams, function(ds, index) {
      var points = $.map(ds.datapoints, function(datapoint) {
        return {
          x : Math.floor(Date.parse(datapoint.at) / 1000),
          y : Number(datapoint.value)
        }
      });
      series[index] = {
        color: palette.color(),
        data: points
      };
    });
    $('<div id="mega-graph"></div>').prependTo($('#charts'));
    var graph = new Rickshaw.Graph({
      element: document.getElementById('mega-graph'),
      width: 400,
      height: 200,
      renderer: 'area',
      max: 100,
      stroke: true,
      series: series
    });
    graph.render();

    var ticksTreatment = 'glow';

    var yAxis = new Rickshaw.Graph.Axis.Y( {
      graph: graph,
      ticksTreatment: ticksTreatment
    } );

    yAxis.render();
  }


  function updateGraph(ds, graphId) {
    var graph = graphs[graphId];
    var data = {
      x : Math.floor(Date.parse(ds.at) / 1000),
      y : Number(ds.current_value)
    }
    datapoints[graphId].push(data);
    datapoints[graphId].shift();
    graph.render();
  }

  cosm.setKey(api_key);

  cosm.feed.history("40360", {'duration':'1minute','interval':0}, function (data) {
    $.each(data.datastreams, function(index, ds) {
      createGraph(ds);
    });
    var filtered = data.datastreams.filter(function(dp){
      return dp.id.match(/cpu_\d*$/)
    });
    createStackedGraph(filtered);
  });

  cosm.feed.subscribe(40360, function(event, data) {
    $.each(data.datastreams, function(index, ds) {
      updateGraph(ds, index);
    });
  });

});

