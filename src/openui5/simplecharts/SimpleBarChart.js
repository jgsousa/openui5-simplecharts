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
         * Constructor for a bar chart
         *
         * @class
         * Vertical bar chart provider
         *
         * @extends sap.ui.core.Control
         *
         * @author João Guilherme Sousa
         * @version 0.1.0
         *
         * @constructor
         * @public
         * @alias openui5.simplecharts.SimpleBarChart
         *
         */

        var SimpleBarChart = Control.extend("openui5.simplecharts.SimpleBarChart", {
                metadata: {
                    library: "openui5.simplecharts",
                    properties: {
                        id:     { type : "string", defaultValue:"ssvgbar" },
                        title:  { type : "string", defaultValue:null },
                        width : {type : "sap.ui.core.CSSSize", defaultValue : "450"},
                        height: {type : "sap.ui.core.CSSSize", defaultValue : "450"},

                        _first: { type : "boolean", defaultValue:true },

                        items: {type: "any", defaultValue: null }
                    }
                }
            }
        );

        SimpleBarChart.prototype._drawGraph = function (iWidth, iHeight) {

            jQuery.sap.require("sap.ui.thirdparty.d3");
            jQuery.sap.require("bower_component.d3-tip.index");


            if(!iWidth) {
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
             Here I get the data and build my data tree according to the dimensions, measures
             and data. Basically there is an object for each value of the X dimension, each one has an array
             of objects for each series (dimensions on the y axis). The bar chart only supports one measure
             it will default to index 0
             */
            var data = this._getData(this.oldData);
            var tree = this._buildDataTree(data,this.oldData);

            this.oldData = data;

            /*
             The width of the chart is less then the witdh of the SVG viewport. I put 10% I think it is nice enough
             */
            var margin = {top: this.controlHeight *0.10 , right: this.controlWidth *0.10,
                bottom: this.controlHeight*0.20, left: this.controlWidth*0.10};
            var width = this.controlWidth - margin.left - margin.right;
            var height = this.controlHeight - margin.top - margin.bottom;

            /*
             If there is more one series, a y dimension, then we must save space for the legend. I'm saving about
             15% space. A bit hit, but if you have a better suggestion, create an issue.
             */
            var x0 = d3.scale.ordinal()
                .rangeRoundBands([0, width - 60], .1);

            var x1 = d3.scale.ordinal();

            /*
             TODO Color scale is hardcoded. I will change this to make it a property of the chart with this as the
             default value
             */
            var color = d3.scale.ordinal()
                .range(["#5cbae6", "#b6d957", "#fac364", "#8cd3ff", "#d998cb", "#f2d249", "#93b9c6"
                    , "#ccc5a8", "#52bacc", "#dbdb46", "#98aafb"]);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x0)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            d3.selectAll(hashId).remove();
            var box = "0 0 " + this.controlWidth + " " + this.controlHeight;

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    var c = color(d.value);
                    return "<Strong>" + d.value + ":" + "</Strong> <span style='color:" + c + "'>"
                        + d.measure + "</span>";
                });

            var svg = d3.select(this.getDomRef()).append("svg")
                .attr("id", aId)
                .attr("viewBox", box )
                .attr("preserveAspectRatio","none")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            var svgt = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            svgt.call(tip);

            var dataset = this.getItems();
            var series = this._getDimensionValues(data, dataset.getAggregation("dimensions"), "y");
            var sNames = [];
            for(var i = 0; i < series.length; i++){
                sNames.push(series[i]["value"]);
            }

            x0.domain(tree.map(function(d) { return d.value; }));
            x1.domain(sNames).rangeRoundBands([0, x0.rangeBand()]);
            y.domain([0, d3.max(tree, function(d) { return d3.max(d.series, function(d) { return d.measure; }); })]);

            svgt.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .style("font-size","small")
                .append("text")
                .attr("y", margin.bottom / 2)
                .attr("x", ( width - 80 ) / 2)
                .style("text-anchor", "end")
                .style("font-size","medium")
                .text(dataset.getDimensionDescriptionForAxis("x"));

            svgt.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .style("font-size","12px")
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", - margin.left)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .style("font-size","small")
                .text(dataset.getMeasureDescriptionByIndex(0));

            var state = svgt.selectAll(".series")
                .data(tree)
                .enter().append("g")
                .attr("class", "g")
                .attr("transform", function(d) { return "translate(" + x0(d.value) + ",0)"; });

            /*
             Here I store the Y scale. I do this because when I'm using the old values for transitions
             I need to use the old scale. Imagine the maximum becomes 70 instead of 90. If I use the new
             scale to draw the 90, it will draw outside of my chart.
             */
            var oldY = this.oldY;
            state.selectAll("rect")
                .data(function(d) { return d.series; })
                .enter().append("rect")
                .attr("width", x1.rangeBand())
                .attr("x", function(d) { return x1(d.value); })
                .attr("y", function(d) {
                    // If there is an old scale, I use it.
                    return ((oldY) ? oldY(d.oldmeasure) : y(d.oldmeasure));
                })
                .attr("height", function(d) {
                    return height - ((oldY) ? oldY(d.oldmeasure) : y(d.oldmeasure));
                })
                .style("fill", function(d) { return color(d.value); })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .transition()
                .attr("y", function(d) { return y(d.measure); })
                .attr("height", function(d) { return height - y(d.measure); })
                .duration(1000);

            svg.append("text")
                .attr("x", ( width / 2))
                .attr("y", 0 + (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "medium")
                .text(this.getProperty("title"));

            /*
             Only draw legend if there is more then one series
             */
            if(this.getItems().getNumberDimensions() > 1){
                this._drawLegend(svgt, sNames, width, color);
            }

            /*
             TODO This is necessary for handle the responsive design. Need to also refresh the axis and the
             legend.
             */

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
        SimpleBarChart.prototype.setDataSet  = function(dataSet){
            this.setProperty("items", dataSet);
        };

        SimpleBarChart.prototype._getData = function(oldData){
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

        SimpleBarChart.prototype._drawLegend = function(svg, xNames, width, color){

            var legend = svg.selectAll(".legend").remove();
            var legend = svg.selectAll(".legend")
                .data(xNames.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill",  color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .style("font-size", "small")
                .text(function(d) { return d; });
        };

        SimpleBarChart.prototype._getDimensionValues = function(oData, oDimensions, axis){
            
            var dimension = "";
            var domain = [];
            var used = [];
            for(var i = 0; i < oDimensions.length; i++){
                var current = oDimensions[i].mProperties["axis"];
                if (current == axis) {
                    dimension = oDimensions[i].mProperties["name"];
                }
            }
            if(!dimension){
                return domain;
            }
            for(var j = 0; j < oData.length; j++){
                var value = oData[j][dimension];
                if(used.indexOf(value) == -1){
                    var object = {};
                    object.value = value;
                    domain.push(object);
                    used.push(value);
                }
            }
            return domain;
        };

        SimpleBarChart.prototype._buildDataTree = function(oData, oldData){
            var dimensions = this.getItems().getAggregation("dimensions");
            var xdomain = this._getDimensionValues(oData, dimensions, "x");
            var ydomain = this._getDimensionValues(oData, dimensions, "y");
            if (ydomain.length == 0){
                ydomain[0] = "Unique"; // only one serie
            }
            var dataset = this.getItems();
            var x = dataset.getLabelForAxis("x");
            var y = dataset.getLabelForAxis("y");
            var measureName = dataset.getMeasureNameByIndex();

            var output = xdomain;
            output.forEach(function(d){
                d.series = [];
                for(var i in ydomain){
                    d.series[i] = {};
                    d.series[i]["value"] = ydomain[i]["value"];
                }
                d.series.forEach(function(name){
                    for(var j = 0; j < oData.length; j++){
                        if(oData[j][x] == d.value && oData[j][y] == name.value ){
                            name.measure = oData[j][measureName];
                        }
                    }
                    for(var j = 0; j < oData.length; j++){
                        if(oData[j][x] == d.value && oData[j][y] == name.value ){
                            name.oldmeasure = oData[j]["old" + measureName];
                        }
                    }
                });
            });
            return output;
        };

        SimpleBarChart.prototype._shouldResize = function(newWidth,oldWidth, newHeight, oldHeight){
            var raciow = ( newWidth - oldWidth) / oldWidth;
            var racioh = ( newHeight - oldHeight) / oldHeight;

            if (Math.abs(raciow) > 0.1 ||  Math.abs(racioh) > 0.1){
                return true;
            }
            else{
                return false;
            }
        };

        SimpleBarChart.prototype.onAfterRendering = function () {
            this._drawGraph();
        };

        return SimpleBarChart;

    }, true);