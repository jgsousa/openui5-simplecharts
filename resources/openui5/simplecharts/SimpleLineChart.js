/*
 Copyright 2015 João Guilherme Sousa

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

sap.ui.define(['jquery.sap.global','sap/ui/core/Control','./library'],
    function(jQuery, Control, library) {
        "use strict";

        /**
         * Constructor for a line chart
         *
         * @class
         * Vertical line chart provider
         *
         * @extends sap.ui.core.Control
         *
         * @author João Guilherme Sousa
         * @version 0.1.0
         *
         * @constructor
         * @public
         * @alias openui5.simplecharts.SimpleLineChart
         *
         */
        var SimpleLineChart = Control.extend("openui5.simplecharts.SimpleLineChart", {
                metadata: {
                    library: "openui5.simplecharts",
                    properties: {
                        id:     { type : "string", defaultValue:"ssvgline" },
                        title:  { type : "string", defaultValue:null },
                        width : {type : "sap.ui.core.CSSSize", defaultValue : "450"},
                        height: {type : "sap.ui.core.CSSSize", defaultValue : "450"},

                        _first: { type : "boolean", defaultValue:true },

                        items: {type: "any", defaultValue: null }
                    }
                }
            }
        );

        SimpleLineChart.prototype._drawGraph = function (iWidth, iHeight) {

            jQuery.sap.require("sap.ui.thirdparty.d3");
            jQuery.sap.require("bower_component.d3-tip.index");

            if (!iWidth){
                this.controlWidth = this.getProperty("width");
                this.controlHeight = this.getProperty("height");
            }
            else{
                this.controlWidth = iWidth;
                this.controlHeight = iHeight;
            }

            /* Controlling the oldWidth is required because of the autoresize of
             grid controls, you don't want the graph size to jump around */

            if(!iWidth && this.oldWidth ){
                this.controlWidth = this.oldWidth;
                this.controlHeight = this.oldHeight;
            }
            this.controlAspect = this.controlWidth / this.controlHeight;

            var aId = this.getProperty("id");
            var hashId = "#" + aId;

            /*
             To control the animations of the graphic I keep a old map of the data
             that way I can make a D3 transitions from the old values to the new values
             */
            if (!this.oldData){
                this.oldData = [];
            }

            /*
             Here I get the data and set the x axis to the names attribute and the measure to the value atribute
             */
            var data = this._getData(this.oldData);
            var tree = this._buildDataTree(data);

            this.oldData = data;

            /*
             The width of the chart is less then the witdh of the SVG viewport. I put 10% I think it is nice enough
             */
            var margin = {top: this.controlHeight *0.10 , right: this.controlWidth *0.10,
                bottom: this.controlHeight*0.10, left: this.controlWidth*0.10};
            var width = this.controlWidth - margin.left - margin.right;
            var height = this.controlHeight - margin.top - margin.bottom;

            var color = d3.scale.ordinal()
                .range(["#5cbae6", "#b6d957", "#fac364", "#8cd3ff", "#d998cb", "#f2d249", "#93b9c6"
                    , "#ccc5a8", "#52bacc", "#dbdb46", "#98aafb"]);

            var x = d3.time.scale()
                .range([0, width]);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var oldY = this.oldY;
            var line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) {
                    return x(d3.time.format("%Y%m%d").parse(d.value));
                })
                .y(function(d) {
                    if(d.type == "old"){
                        return ((oldY) ? oldY(Number(d.measure)) : y(Number(d.measure)));
                        //return y(Number(d.measure));
                    } else{
                        return y(Number(d.measure));
                    }

                });


            var svg = d3.selectAll(hashId).remove();
            var svg = d3.select(this.getDomRef()).append("svg")
                .attr("id", aId)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var dataset = this.getItems();
            var xvalues = dataset.getDimensionValues("x");
            x.domain(d3.extent(xvalues, function(d) {
                return d3.time.format("%Y%m%d").parse(d.value); }));

            y.domain([
                d3.min(tree, function(c) { return d3.min(c.series, function(v) { return Number(v.measure); }); }),
                d3.max(tree, function(c) { return d3.max(c.series, function(v) { return Number(v.measure); }); })
            ]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text(dataset.getMeasureDescriptionByIndex(0));

            var serie = svg.selectAll(".serie")
                .data(tree)
                .enter().append("g")
                .attr("class", "city");

            serie.append("path")
                .attr("class", "line")
                .attr("d", function(d) {
                    return line(d.oseries);
                })
                .style("stroke", function(d) {
                    return color(d.value);
                })
                .transition()
                .attr("d", function(d) {
                    return line(d.series);
                })
                .duration(1000);


            serie.append("text")
                .datum(function(d) { return {name: d.value, value: d.series[d.series.length - 1]}; })
                .attr("transform", function(d) {
                    return "translate(" + x(d3.time.format("%Y%m%d").parse(d.value.value)) + ","
                        + y(d.value.measure) + ")"; })
                .attr("x", 3)
                .attr("dy", ".35em");

            this._drawLegend(svg, width, color);
            if(!this.resize) {
                this.resize = sap.ui.core.ResizeHandler.register(this, function (oEvent) {
                    var chart = oEvent.control;
                    var w = Math.min(chart.getProperty("width"), this.iWidth);
                    var h = Math.min(chart.getProperty("height"), this.iHeight);
                    if(chart._shouldResize(w, chart.controlWidth, h,
                            chart.controlHeight)) {
                        h = w / chart.controlAspect;
                        chart._drawGraph(w, h);
                    }
                });
            }
            this.oldY = y;
            this.oldWidth = this.controlWidth;
            this.oldHeight = this.controlHeight;
        };

        /**
         * This function will attach a dataset your chart and redraw the control. The control
         * takes into account the old dataset in order to process transitions.
         * @param dataSet A object of the SimpleChartData type. The object should be set with at least one dimension
         *                , data and one measure. If the dataset has more then one measure it will be ignore as the
         *                chart doesn't support multiple axis.
         */
        SimpleLineChart.prototype.setDataSet  = function(dataSet){
            this.setProperty("items", dataSet);
        };

        SimpleLineChart.prototype._getData = function(oldData){
            var aItems = this.getItems().getChartData().items;

            if(aItems.length == 0){
                return;
            }

            var data = [];
            for (var i = 0; i < aItems.length; i++) {
                var oEntry = {};
                var keys = Object.keys(aItems[i]);
                for (var j in keys) {
                    var variable = keys[j]
                    var oldObject = oldData[i];
                    if(!aItems[i][variable] && (!oldObject || !oldObject[variable]) ){
                        continue;
                    }
                    oEntry[variable] = aItems[i][variable];
                    if (oldObject && variable !== "label") {
                        oEntry["old" + variable] = oldObject[variable];
                    }
                    else if(variable != "label") {
                        oEntry["old" + variable] = "0";

                    }
                }
                data.push(oEntry);
            }
            return data;
        };

        SimpleLineChart.prototype._buildDataTree = function(oData){
            var dataset = this.getItems();
            var dimensions = this.getItems().getAggregation("dimensions");
            var xdomain = dataset.getDimensionValues("x");
            var ydomain = dataset.getDimensionValues("y");
            if (ydomain.length == 0){
                ydomain[0] = "Unique"; // only one serie
            }
            var dataset = this.getItems();
            var x = dataset.getLabelForAxis("x");
            var y = dataset.getLabelForAxis("y");
            var measureName = dataset.getMeasureNameByIndex();

            var output = ydomain;
            output.forEach(function(d){

                d.series = [];
                d.oseries = [];
                for(var i in xdomain){
                    d.series[i] = {};
                    d.series[i]["value"] = xdomain[i]["value"];
                    d.oseries[i] = {};
                    d.oseries[i]["value"] = xdomain[i]["value"];
                }
                d.series.forEach(function(name){
                    for(var j = 0; j < oData.length; j++){
                        if(oData[j][y] == d.value && oData[j][x] == name.value ){
                            name.measure = oData[j][measureName];
                        }
                    }
                    name.type = "Current";
                });
                d.oseries.forEach(function(name){
                    for(var j = 0; j < oData.length; j++){
                        if(oData[j][y] == d.value && oData[j][x] == name.value ){
                            name.measure = oData[j]["old" + measureName];
                        }
                    }
                    if(!name.measure){
                        name.measure = 0;
                    }
                    name.type = "old";
                });

            });
            return output;
        };

        SimpleLineChart.prototype._shouldResize = function(newWidth,oldWidth, newHeight, oldHeight){
            var raciow = ( newWidth - oldWidth) / oldWidth;
            var racioh = ( newHeight - oldHeight) / oldHeight;

            if (Math.abs(raciow) > 0.1 ||  Math.abs(racioh) > 0.1){
                return true;
            }
            else{
                return false;
            }
        };

        SimpleLineChart.prototype._drawLegend = function(svg, width, color){

            var dataset = this.getItems();

            var sNames = [];
            var ydomain = dataset.getDimensionValues("y");
            for(var i = 0; i < ydomain.length; i++){
                sNames.push(ydomain[i]["value"]);
            }

            var legend = svg.selectAll(".legend").remove();
            var legend = svg.selectAll(".legend")
                .data(sNames.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(0," + (i * 20) + ")";
                });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("y", 10)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 19)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .style("font-size", "small")
                .text(function(d) {
                    return d;
                });
        };


        SimpleLineChart.prototype.onAfterRendering = function () {
            this._drawGraph();
        };

        return SimpleLineChart;

    }, true);