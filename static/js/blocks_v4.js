var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;


var current_year = '2017'


var minYear = 2500;
var maxYear = 1500;

var map_features = ["GDP per capita (current LCU)",
                    "Exports of goods and services (% of GDP)",
                    "Health expenditure, public (% of GDP)",
                    "Immunization, BCG (% of one-year-old children)",
                    "Improved sanitation facilities (% of population with access)",
                    "Life expectancy at birth, total (years)",
                    "Literacy rate, adult total (% of people ages 15 and above)",
                    "Mortality rate, infant (per 1,000 live births)",
                    "Population, total",
                    "School enrollment, primary (% gross)",
                    "Unemployment, total (% of total labor force)",
                    "Urban population (% of total)"]

var map_svg, bar_svg, line_svg, feat_svg, bi_svg, sm_svg;


// var map_features = ["GDP per Capita", "Life Expectancy"];
var current_feature;


function initialize(data, mds_data, sm_data, bi_data, feat_data){
  // console.log("v1")
  // render_map_plot();

  current_feature = map_features[0];

  prepare_dropdown();

  map_svg = d3.select("#graph").append("svg:svg")
  map_svg.attr("id", "map_svg")

  line_svg = d3.select("#line_chart").append("svg:svg")
  line_svg.attr("id", "line_svg")

  bar_svg = d3.select("#bar_chart").append("svg:svg")
  bar_svg.attr("id", "bar_svg")

  sm_svg = d3.select("#sm_chart").append("svg:svg")
  sm_svg.attr("id", "sm_svg")

  bi_svg = d3.select("#bi_chart").append("svg:svg")
  bi_svg.attr("id", "bi_svg")

  feat_svg = d3.select("#feat_chart").append("svg:svg")
  feat_svg.attr("id", "feat_svg")


  console.log("v2");
  render_plot(data, mds_data, sm_data, bi_data, feat_data);
}


function render_plot(data, mds_data, sm_data, bi_data, feat_data, drawMDS=true, drawFeat=true, drawBi=true){

  // d3.selectAll("svg > *").remove();
  render_map_plot_v2(data);
  console.log("MDS DATA")
  console.log(mds_data)
  console.log("Finish mds")
  console.log("Scatter Matrix DATA")
  console.log(sm_data)
  console.log("Finish sm")
  if(drawMDS){
    drawScatter(mds_data);
  }
  drawScatterMatrix(sm_data);
  if(drawMDS){
    drawBiPlot(bi_data);
  }
  if(drawMDS){
    drawFeats(feat_data)
  }

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


  var x = d3.scaleBand().rangeRound([0, con_width-50]).padding(0.1),
  y = d3.scaleLinear().rangeRound([con_height-50, 0]);
  var g = line_svg.append("g")
  .attr("transform", "translate(" + 50 + "," + 10 + ")");


  var line = d3.line()
    .x(function(d) { return x(d.x); })
    .y(function(d) { return y(d.y); })
    .curve(d3.curveMonotoneX)


  x.domain(time_data.map(function(d) { return d.x; }));

  y.domain([0, d3.max(time_data, function(d) { return d.y; })]);
  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + (con_height-50) + ")")
      .call(d3.axisBottom(x));

  g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10))
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
                     .scale(120)
                    .translate( [width / 2, height / 1.5]);

  var path = d3.geoPath().projection(projection);

  // svg.call(tip);

  queue()
    .defer(d3.json, "https://raw.githubusercontent.com/sauradeeppaul/inequality-dashboard-visualization/master/data/world_countries_features.json")
    .await(ready);


  function ready(error, country_features) {
    if (error) throw error;

    var data_column = current_feature

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
      console.log(current_year);
      param = current_year.toString().concat("slider");
      $.post("", {'function': 'dropdown:' + current_feature + ";slider:" + current_year}, function(data_infunc){
          mds_data = JSON.parse(data_infunc.mds_data)
          drawScatter(mds_data);
      });
      render_plot(mapData, mds_data, sm_data, bi_data, feat_data, drawMDS=false, drawFeat=false, drawBi=false);
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
      .attr("id", "map_group")
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




    var map_bb = document.getElementById("graph").getBoundingClientRect();
    console.log("bbox");
    console.log(map_bb);

    var map_g = map_svg.select("g");
    var g_bb = document.getElementById("map_group").getBoundingClientRect();
    console.log("g bbox");
    console.log(g_bb);

    map_g.attr("transform", "translate(" + (map_bb.x - g_bb.x) + "," + (map_bb.y - g_bb.y - 30) + ")");

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

    $.post("", {'function': 'dropdown:' + current_feature + ";slider:" + current_year}, function(data_infunc){
        mapData = JSON.parse(data_infunc.chart_data);
        mds_data = JSON.parse(data_infunc.mds_data)
        sm_data = JSON.parse(data_infunc.sm_data);
        console.log("new data: ")
        console.log(mds_data)
        console.log("new data: ")
        console.log(sm_data)
        console.log("new data: ")
        console.log(mapData)
        bi_data = JSON.parse(data_infunc.bi_data)
        // /ax_data = JSON.parse(data_infunc.ax_data);
        feat_data = JSON.parse(data_infunc.feat_data)
        console.log("new data: ")
        console.log(bi_data)
        console.log("new data: ")
        // console.log(ax_data)
        console.log("new data: ")
        console.log(feat_data)
        console.log("Finish new data")
        render_plot(mapData, mds_data, sm_data, bi_data, feat_data);
    });

    // render_plot();
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


function drawScatter(mds_data){

  var con_width = document.getElementById('bar_chart').offsetWidth;
  var con_height = document.getElementById('bar_chart').offsetHeight;

  console.log("MDS Data:")
  console.log(mds_data)

  bar_svg.selectAll("*").remove();

  var xScale = d3.scaleLinear()
               .rangeRound([0, con_width-50])
               .domain([d3.min(mds_data, (function (d) {
                 return d.x;
               })), d3.max(mds_data, (function (d) {
                 return d.x;
               }))]);

   var  yScale = d3.scaleLinear()
                .rangeRound([con_height-50, 0])
                .domain([d3.min(mds_data, (function (d) {
                  return d.y;
                })), d3.max(mds_data, (function (d) {
                  return d.y;
                }))]);

   // var svg = d3.select("svg")
   //        .attr("width", width + margin.left + margin.right)
   //        .attr("height", height + margin.top + margin.bottom)

    var g = bar_svg.append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              // g.append("text")
              //        .attr("x", (width / 2))
              //        .attr("y", 0 - (margin.top / 2))
              //        .attr("text-anchor", "middle")
              //        .style("font-size", "16px")
              //        .style("text-decoration", "underline")
              //        .text("Scatter Plot - Projection on 2 PCA");

    // axis-x

    g.attr("transform", "translate(" + 25 + "," + 25 + ")")
    g.append("g")
        .attr("transform", "translate(0," + yScale(0) + ")")
        .call(d3.axisBottom(xScale))


    // axis-y
    g.append("g")
        //.attr("class", "axis axis--y")
        .attr("transform", "translate(" + xScale(0) + ",0)")
        .call(d3.axisLeft(yScale));




    g.selectAll(".dot")
        .data(mds_data)
      .enter().append("circle") // Uses the enter().append() method
        .attr("class", "scatter") // Assign a class for styling
        .attr("r", 2)
        .attr("cx", function(d) { return xScale(d.x); })
        .attr("cy", function(d) { return yScale(d.y) })
}

function drawBiPlot(bi_data){

  dots = bi_data
  console.log(dots)
  // vectors = axes_data

  var con_width = document.getElementById('bi_chart').offsetWidth;
  var con_height = document.getElementById('bi_chart').offsetHeight;
      // Set ranges
      bi_svg.selectAll("*").remove();

      var xScale = d3.scaleLinear()
                   .rangeRound([0, con_width-50])
                   .domain([d3.min(dots, (function (d) {
                     return d.PCA1;
                   })), d3.max(dots, (function (d) {
                     return d.PCA1;
                   }))]);

       var  yScale = d3.scaleLinear()
                    .rangeRound([con_height-50, 0])
                    .domain([d3.min(dots, (function (d) {
                      return d.PCA2;
                    })), d3.max(dots, (function (d) {
                      return d.PCA2;
                    }))]);

        var g = bi_svg.append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        g.attr("transform", "translate(" + 25 + "," + 25 + ")")
        g.append("g")
            .attr("transform", "translate(0," + yScale(0) + ")")
            .call(d3.axisBottom(xScale))


        // axis-y
        g.append("g")
            //.attr("class", "axis axis--y")
            .attr("transform", "translate(" + xScale(0) + ",0)")
            .call(d3.axisLeft(yScale));




        g.selectAll(".dot")
            .data(dots)
          .enter().append("circle") // Uses the enter().append() method
            .attr("class", "scatter") // Assign a class for styling
            .attr("r", 2)
            .attr("cx", function(d) { return xScale(d.PCA1); })
            .attr("cy", function(d) { return yScale(d.PCA2) })

      // var tip = d3.tip()
      //   .attr('class', 'd3-tip')
      //   .offset([-10, 0])
      //   .html(function(d, i) {
      //     return "<strong>Data point:</strong> <span style='color:#47ffb5'>" + i + "</span>";
      // })

      // circles.on('mouseover', tip.show)
      //     .on('mouseout', tip.hide)
      //
      // svg.call(tip);
      //
      // var line = d3.line()
      //   .x(function(d, i){return x(d[2]);})
      //   .y(function(d, i){return y(d[3]);})

      // var lines = svg.selectAll("line")
      //   .data(vectors)
      //   .enter().append("line")
      //     .attr("class", "line")
      //     .attr("x1", function(d) {
      //       return d[0];
      //     })
      //     .attr("y1", function(d) {
      //       return d[1];
      //     })
      //     .attr("x2", function(d) {
      //       return d[2];
      //     })
      //     .attr("y2", function(d) {
      //       return d[3];
      //     })

      // lines = svg.append("path")
      //   .attr("d", function(d) { return line(vectors)})
      //   .attr("transform", "translate(0,0)")
      //   .style("stroke-width", 2)
      //   .style("stroke", "steelblue")
      //   .style("fill", "none")
      //   .style("opacity", 0)
      //   .text("hi");
      //
      // lines.transition()
      //     .duration(700)
      //     .delay(500)
      //     .ease(d3.easeLinear)
      //     .style("opacity", 1);

// var tip2 = d3.tip()
//   .attr('class', 'd3-tip')
//   .offset([-10, 0])
//   .html(function(d, i) {
//     return "<strong>Vector:</strong> <span style='color:#47ffb5'>" + i + "</span>";
// })

// lines.on('mouseover', tip2.show)
//     .on('mouseout', tip2.hide)

// svg.call(tip2);
}

function drawScatterMatrix(data){

  console.log(data)

  var con_width = document.getElementById('sm_chart').offsetWidth;
  var con_height = document.getElementById('sm_chart').offsetHeight;

    var width =  950 - margin.left - margin.right,
      size = 150,
      padding = 20;

    var x = d3.scaleLinear()
        .range([padding / 2, con_width/2 - padding / 2]);

    var y = d3.scaleLinear()
        .range([con_height/2 - padding / 2, padding / 2]);

    var xAxis = d3.axisBottom()
        .scale(x)
        .ticks(6);
      var yAxis = d3.axisLeft()
      .scale(y)
      .ticks(6);
  sm_svg.selectAll("*").remove();
  var domainByTrait = {},
      traits = d3.keys(data[0]),
      n = traits.length;

  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
  });

  xAxis.tickSize(con_width/2 * n);
  yAxis.tickSize(-con_height/2 * n);


  sm_svg.attr("width", con_width * n)
      .attr("height", con_height * n)
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  sm_svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * con_width/2 + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  sm_svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * con_height/2 + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  var cell = sm_svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * con_width/2 + "," + d.j * con_height/2 + ")"; })
      .each(plot);

  // Titles for the diagonal.
  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

      function plot(p) {
        var cell = d3.select(this);

        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", con_width/2 - padding)
            .attr("height", con_height/2 - padding);

        cell.selectAll("circle")
            .data(data)
          .enter().append("circle")
            .attr("cx", function(d) { return x(d[p.x]); })
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 2)
            .style("fill", function(d) { return "#4682b4"; });
      }

      function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
      }

}


function drawFeats(feat_data) {

  var CONTAINER_MARGIN = 100;

    // Get the data again
      // Request the "" page and send some additional data along (while still ignoring the return results).
    // $.post("", {'data': 'received'}, function(data_infunc){
      // console.log({data_infunc})
  var con_width = document.getElementById('feat_chart').offsetWidth;
  var con_height = document.getElementById('feat_chart').offsetHeight;


    data2 = feat_data
    //console.log(data2);

    //console.log(data2);
    // Scale the range of the data again
    console.log(data2)

    feat_svg.selectAll("*").remove();

    // bar_svg.attr("width", width + margin.left + margin.right)
    //         .attr("height", height + margin.top + margin.bottom)
    var xScale = d3.scaleBand()
              .rangeRound([0, con_width-CONTAINER_MARGIN])
              .padding(0.1)
              .domain(data2.map(function(d) {
                return d.feature;
              }));

     var  yScale = d3.scaleLinear()
                  .rangeRound([con_height-CONTAINER_MARGIN/2, 0])
                  .domain([0, d3.max(data2, (function (d) {
                    return d.value;
                  }))]);

      var g = feat_svg.append("g")
                .attr("transform", "translate(" + (margin.left + CONTAINER_MARGIN/2) + "," + (margin.top + CONTAINER_MARGIN/4) + ")");
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
          .attr("transform", "translate(0," + (con_height-CONTAINER_MARGIN/2) + ")")
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
        .attr("height", function(d) { return con_height-CONTAINER_MARGIN/2 - yScale(d.value); })
        .attr("fill",
        function(d,i){
          if (i<3){
        return ("salmon");}
        else{ return "steelblue"} });

}
