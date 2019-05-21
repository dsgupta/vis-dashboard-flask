var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


var current_year = '2017'


var minYear = 2500;
var maxYear = 1500;

var map_svg, bar_svg, line_svg;


var map_features = ["GDP per Capita", "Life Expectancy"];
var current_feature;

function onLoad(data){
  initialize(data)
}
function initialize(){
  // console.log("v1")
  // render_map_plot();

  current_feature = map_features[0];

  prepare_dropdown();

  prepare_modal();

  map_svg = d3.select("#graph").append("svg:svg")
  map_svg.attr("id", "map_svg")

  bar_svg = d3.select("#bar_chart").append("svg:svg")
  bar_svg.attr("id", "bar_svg")

  line_svg = d3.select("#line_chart").append("svg:svg")
  line_svg.attr("id", "line_svg")


  console.log("v2");
  render_plot(data);
}


function render_plot(data){

  // d3.selectAll("svg > *").remove();
  render_map_plot_v2(data);
}


function render_scatter_plot(data){
  // parse the date / time
  console.log("Data for line chart!")
  console.log(data)
  line_svg.selectAll("*").remove();
  // set the ranges
  var string_data = d3.entries(data);
  console.log(string_data)

  var time_data = [];

  for(var i=0 ; i < string_data.length ;i++){
    t = string_data[i]
    time_data.push({"x": t.key, "y": parseFloat(t.value)});
  }
  console.log("NEW!")
  console.log(time_data)

  var con_width = document.getElementById('line_chart').offsetWidth;
  var con_height = document.getElementById('line_chart').offsetHeight;


  var x = d3.scaleBand().rangeRound([0, con_width]).padding(0.1),
  y = d3.scaleLinear().rangeRound([con_height, 0]);
  var g = line_svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var line = d3.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); })

  x.domain(time_data.map(function(d) { return d.x; }));

  y.domain([0, d3.max(time_data, function(d) { return d.y; })]);
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + con_height + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

  g.append("path")
    .datum(time_data)
    .attr("class", "line")
    .attr("d", line);

  g.selectAll("circle")
    .data(time_data)
  .enter().append("circle")
    .attr("class", "circle")
    .attr("cx", function(d) { return x(d.x); })
    .attr("cy", function(d) { return y(d.y); })
    .attr("r", 4);

}


function render_map_plot_v2(data){
  console.log("Called render map plot v2")
  var format = d3.format(",");

  // var csv_file;
  //
  // if (current_feature == map_features[0]){
  //   csv_file = "https://raw.githubusercontent.com/sauradeeppaul/inequality-dashboard-visualization/master/visualization%20source%20data/gdp-per-capita-worldbank.csv";
  // } else if(current_feature == map_features[1]){
  //   csv_file = "https://raw.githubusercontent.com/sauradeeppaul/inequality-dashboard-visualization/master/visualization%20source%20data/life-expectancy.csv"
  // }
  //
  // console.log("Loading data from " + csv_file);

  var mapData = data
  console.log("MAP DATA")
  console.log(mapData)

  var g = map_svg.append('g')
  .attr('class', 'map');

  // var tip = d3.tip()
  //           .attr('class', 'd3-tip')
  //           .offset([-10, 0])
  //           .html(function(d) {
  //             console.log(d)
  //             return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br><strong>" + current_feature + ": </strong><span class='details'>" + parseFloat(d.val).toFixed(2) +"</span>";
  //           })

  var path = d3.geoPath();


  var projection = d3.geoMercator()
                     .scale(130)
                    .translate( [width / 2, height / 1.5]);

  var path = d3.geoPath().projection(projection);

  // svg.call(tip);

  queue()
    .defer(d3.json, "https://raw.githubusercontent.com/sauradeeppaul/inequality-dashboard-visualization/master/data/world_countries_features.json")
    .await(ready);


  function ready(error, country_features) {
    if (error) throw error;

    var data_column = 'GDP per capita (current LCU)'

    var populationByCountry = {};

    // console.log(data);

    var minVal = 1000000;
    var maxVal = 0;
    console.log("Inside ready")
    console.log(mapData)
    var timeSeries = {};

    mapData.forEach(function(d) {
      if (populationByCountry[d['Year']] == undefined || populationByCountry[d['Year']].length == 0)
        populationByCountry[d['Year']] = {};

      minYear = Math.min(minYear, parseInt(d['Year']));
      maxYear = Math.max(maxYear, parseInt(d['Year']));

      populationByCountry[d['Year']][d['Code']] = d[data_column];

      if(d['Year'] == current_year){
        minVal = Math.min(minVal, parseInt(d[data_column]));
        maxVal = Math.max(maxVal, parseInt(d[data_column]));
      }});

      mapData.forEach(function(d) {
        if (timeSeries[d['Code']] == undefined || timeSeries[d['Code']].length == 0)
          timeSeries[d['Code']] = {};

          timeSeries[d['Code']][d['Year']] = d[data_column];

        });


    country_features.features.forEach(function(d) {
      // console.log("loading to features:")
      // console.log(d)
      d.val = populationByCountry[current_year][d.id] });

    console.log(populationByCountry);
    console.log("Min Year: " + minYear);
    console.log("Max Year: " + maxYear);

    console.log("Min Val: " + minVal);
    console.log("Max Val: " + maxVal);

    document.getElementById("slider").oninput = function() {
      var val = document.getElementById("slider").value
      var slidermin = document.getElementById("slider").min
      var slidermax = document.getElementById("slider").max
      console.log("slider val: " + val)

      current_year = minYear + Math.floor((maxYear-minYear)*(val-slidermin)/(slidermax - slidermin))

      $.post("", {'function': "slider"}, function(data_infunc){
        mapData = JSON.parse(data_infunc.chart_data);
        console.log("new data: ")
        console.log(mapData);
        render_plot(mapData);
      });
    };

    var color = d3.scaleLinear()
    .domain([minVal, Math.sqrt(minVal*maxVal), maxVal])
    .range(["rgb(242, 52, 19)", "rgb(244, 244, 9)", "rgb(44, 186, 44)"]);

    // console.log("Population By Country")
    // console.log(populationByCountry)

    console.log("Time series Data")
    console.log(timeSeries)
    map_svg.selectAll("g").remove();
    map_svg.append("g")
      .attr("class", "countries")
      .selectAll("path")
        .data(country_features.features)
      .enter().append("path")
        .attr("d", path)
        .style("fill", function(d) {
          // console.log("V2 stuff: ")
          // console.log(d);
          var c = color(populationByCountry[current_year][d.id])
          // console.log(populationByCountry[current_year][d.id])
          // console.log(c);
          return c; })
        .style('stroke', 'white')
        .style('stroke-width', 1.5)
        .style("opacity",0.8)
        // tooltips
          .style("stroke","white")
          .style('stroke-width', 0.3)
          .on('mouseover',function(d){
            // tip.show(d);

            d3.select(this)
              .style("opacity", 1)
              .style("stroke","white")
              .style("stroke-width",3);
          })
          .on('mouseout', function(d){
            // tip.hide(d);

            d3.select(this)
              .style("opacity", 0.8)
              .style("stroke","white")
              .style("stroke-width",0.3);
          })
          .on("click", function(d){
            // tip.hide(d);
            render_scatter_plot(timeSeries[d.id]);
          })

    map_svg.append("path")
        .datum(topojson.mesh(country_features.features, function(a, b) { return a.id !== b.id; }))
         // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
        .attr("class", "names")
        .attr("d", path);

    console.log("Map plotted for " + current_year);

  }
}


function prepare_dropdown() {
  console.log("F:prepareDropdown()")

  var dropdownChange = function () {
    console.log("-------------------------------------------------------")
    console.log("F:dropdownChange()")

    var new_feature = d3.select(this).property('value');
    current_feature = new_feature;
    render_plot();
    console.log("Field:", current_feature);
  };

  dropdown = d3.select("#dropdown")
    .insert("select", "svg")
    .on("change", dropdownChange);

  dropdown.selectAll("option")
    .data(map_features)
    .enter().append("option")
    .attr("value", function (d) {
      return d;
    })
    .text(function (d) {
      return d[0].toUpperCase() + d.slice(1, d.length);
    });
}

function drawScree(value) {


      var colorScale = d3.scaleOrdinal(d3.schemeCategory20b);
      $.post("", {'function': value}, function(data_infunc){
      data2 = JSON.parse(data_infunc.chart_data)

      console.log(data2)


      bar_svg.selectAll("*").remove();

      // bar_svg.attr("width", width + margin.left + margin.right)
      //         .attr("height", height + margin.top + margin.bottom)

      var xScale = d3.scaleBand()
                .rangeRound([0, width])
                .padding(0.1)
                .domain(data2.map(function(d) {
                  return d.x;
                }));

       var  yScale = d3.scaleLinear()
                    .rangeRound([height, 0])
                    .domain([0, d3.max(data2, (function (d) {
                      return d.y;
                    }))]);

        var g = bar_svg.append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                  // g.append("text")
                  //        .attr("x", (width / 2))
                  //        .attr("y", 0 - (margin.top / 2))
                  //        .attr("text-anchor", "middle")
                  //        .style("font-size", "16px")
                  //        .style("text-decoration", "underline")
                  //        .text("Scree Plot - 12 PCA Components ");

        // axis-x
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).ticks(12))

        g.append("text")
           .attr("x", width - 20)
           .attr("y", height - 5)
           .attr("text-anchor", "end")
           .attr("stroke", "black")
           .text("PCA");


        // axis-y
        g.append("g")
            //.attr("class", "axis axis--y")
            .call(d3.axisLeft(yScale));

            g.append("text")
               .attr("x", 10)
               .attr("y", 20)
               .attr("text-anchor", "end")
               .attr("transform", "rotate(-90)")
               .attr("stroke", "black")
               .text("Variance");

        var bar = g.selectAll("rect")
          .data(data2)
          .enter().append("g");



        // bar chart

        bar.append("rect")
          .attr("x", function (d) { return xScale(d.x); })
          .attr("y", function(d) { return yScale(d.y2); })
          .attr("width", xScale.bandwidth())
          .attr("height", function(d) { return height - yScale(d.y2); })
          .attr("fill", function(d,i){return colorScale(i);});


        // labels on the bar chart



        // line chart
        var line = d3.line()
            .x(function(d, i) { return xScale(d.x) + xScale.bandwidth() / 2; })
            .y(function(d) { return yScale(d.y); })
            // .curve(d3.curveMonotoneX);

        g.append("path")
          .attr("class", "line") // Assign a class for styling
          .attr("d", line(data2)); // 11. Calls the line generator

        g.selectAll(".dot")
            .data(data2)
          .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function(d, i) { return xScale(d.x) + xScale.bandwidth() / 2; })
            .attr("cy", function(d) { return yScale(d.y) })
            .attr("r", 5)
            .attr("fill", function(d, i){ if (i==4) return "red"});

            g.append("line")
              .attr("x1", function(d, i) { return xScale(5) + xScale.bandwidth() / 2 })
              .attr("y1", 0)
              .attr("x2", function(d, i) { return xScale(5) + xScale.bandwidth() / 2})
              .attr("y2", height)
              .style("stroke-width", 2)
              .style("stroke", "red")
              .style("fill", "none")



    console.log(value)

})}

function drawFeats() {

    // Get the data again
      // Request the "" page and send some additional data along (while still ignoring the return results).
    // $.post("", {'data': 'received'}, function(data_infunc){
      // console.log({data_infunc})

      $.post("", {'function': 'feats'}, function(data_infunc){
      data2 = JSON.parse(data_infunc.chart_data)
      //console.log(data2);

      //console.log(data2);
      // Scale the range of the data again
      console.log(data2)

      bar_svg.selectAll("*").remove();

      // bar_svg.attr("width", width + margin.left + margin.right)
      //         .attr("height", height + margin.top + margin.bottom)
      var xScale = d3.scaleBand()
                .rangeRound([0, width])
                .padding(0.1)
                .domain(data2.map(function(d) {
                  return d.feature;
                }));

       var  yScale = d3.scaleLinear()
                    .rangeRound([height, 0])
                    .domain([0, d3.max(data2, (function (d) {
                      return d.value;
                    }))]);

        var g = svg.append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                  //
                  // g.append("text")
                  //        .attr("x", (width / 2))
                  //        .attr("y", 0 - (margin.top / 2))
                  //        .attr("text-anchor", "middle")
                  //        .style("font-size", "16px")
                  //        .style("text-decoration", "underline")
                  //        .text("Feature Importance - Top Three Features");

        // axis-x
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).ticks(12))
        // axis-y
        g.append("g")
            //.attr("class", "axis axis--y")
            .call(d3.axisLeft(yScale));

        var bar = g.selectAll("rect")
          .data(data2)
          .enter().append("g");



        // bar chart
        console.log(data2.length)
        bar.append("rect")
          .attr("x", function (d) { return xScale(d.feature); })
          .attr("y", function(d) { return yScale(d.value); })
          .attr("width", xScale.bandwidth())
          .attr("height", function(d) { return height - yScale(d.value); })
          .attr("fill",
          function(d,i){
            if (i<3){
          return ("salmon");}
          else{ return "steelblue"} });

  })
}


function prepare_modal(){
  // Get the modal
  var modal = document.getElementById('myModal');

  // Get the button that opens the modal
  var pca_btn = document.getElementById("pca_button");
  var sim_btn = document.getElementById("sim_button");

  // Get the <span> element that closes the modal
  // var span = document.getElementById("close");

  // console.log(span)

  // When the user clicks on the button, open the modal
  pca_btn.onclick = function() {
    console.log("PCA")
    drawFeats()
  }

  sim_btn.onclick = function() {
    console.log("Similarity")
    modal.style.display = "block";
  }


  // When the user clicks on <span> (x), close the modal
  // span.onclick = function() {
  //   modal.style.display = "none";
  // }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
