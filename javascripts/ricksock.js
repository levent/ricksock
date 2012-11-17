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
  var ticksTreatment = 'glow';

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
      max: 110,
      stroke: true,
      series: [{
        color: 'steelblue',
        data: datapoint
      }]
    });
    graphs.push(graph);
    graph.render();

    var yAxis = new Rickshaw.Graph.Axis.Y( {
      graph: graph,
      ticksTreatment: ticksTreatment
    } );

    yAxis.render();
  }

  function createStackedGraph(datastreams) {
    var palette = new Rickshaw.Color.Palette( { scheme: 'colorwheel' } );
    var series = [];
    $.map(datastreams, function(ds, index) {
      if (typeof(ds.datapoints) !== 'undefined') {
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
      }
    });
    $('<div id="mega-graph"></div>').prependTo($('#charts'));
    console.log(series);
    var graph = new Rickshaw.Graph({
      element: document.getElementById('mega-graph'),
      width: 400,
      height: 200,
      renderer: 'area',
      stroke: true,
      series: series
    });
    graph.render();

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

  cosm.feed.history(38997, {'duration':'1minute','interval':0}, function (data) {
    $.each(data.datastreams, function(index, ds) {
      if (typeof(ds.datapoints) !== 'undefined')
        createGraph(ds);
    });
    var filtered = data.datastreams.filter(function(dp){
      return dp.id.match(/cpu_\d*$/)
    });
    createStackedGraph(filtered);
  });

  cosm.feed.subscribe(38997, function(event, data) {
    $.each(data.datastreams, function(index, ds) {
      updateGraph(ds, index);
    });
  });

});

