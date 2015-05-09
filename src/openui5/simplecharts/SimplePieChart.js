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
         * Constructor for a pie chart
         *
         * @class
         * Vertical pie chart provider
         *
         * @extends sap.ui.core.Control
         *
         * @author João Guilherme Sousa
         * @version 0.1.0
         *
         * @constructor
         * @public
         * @alias openui5.simplecharts.SimplePieChart
         *
         */
        var SimplePieChart = Control.extend("openui5.simplecharts.SimplePieChart", {
                metadata: {
                    library: "openui5.simplecharts",
                    properties: {
                        id:     { type : "string", defaultValue:"ssvgpie" },
                        title:  { type : "string", defaultValue:null },
                        width : {type : "sap.ui.core.CSSSize", defaultValue : "450"},
                        height: {type : "sap.ui.core.CSSSize", defaultValue : "450"},

                        _first: { type : "boolean", defaultValue:true },

                        items: {type: "any", defaultValue: null }
                    }
                }
            }
        );

        SimplePieChart.prototype._drawGraph = function (iWidth, iHeight) {

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

            this.oldData = data;

            /*
             The width of the chart is less then the witdh of the SVG viewport. I put 10% I think it is nice enough
             */
            var margin = {top: this.controlHeight *0.10 , right: this.controlWidth *0.10,
                bottom: this.controlHeight*0.10, left: this.controlWidth*0.10};
            var width = this.controlWidth - margin.left - margin.right;
            var height = this.controlHeight - margin.top - margin.bottom;

            var radius = Math.min(width, height) / 2.5;

            var color = d3.scale.ordinal()
                .range(["#5cbae6", "#b6d957", "#fac364", "#8cd3ff", "#d998cb", "#f2d249", "#93b9c6"
                , "#ccc5a8", "#52bacc", "#dbdb46", "#98aafb"]);

            var arc = d3.svg.arc()
                .outerRadius(radius - 10)
                .innerRadius(0);

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) {
                    return d.value;
                });

            var svg = d3.selectAll(hashId).remove();
            var svg = d3.select(this.getDomRef()).append("svg")
                .attr("id", aId)
                .attr("width", this.controlWidth)
                .attr("height", this.controlHeight);

            var svgt = svg.append("g")
                .attr("transform", "translate(" + width / 2.5 + "," + height / 2     + ")");

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    var c = color(d.data.name);
                    return "<Strong>" + d.data.name + ":" + "</Strong> <span style='color:" + c + "'>"
                        + d.data.value + "</span>";
                });
            svgt.call(tip);

            var g = svgt.selectAll(".arc")
                .data(pie(data))
                .enter().append("g")
                .attr("class", "arc")
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            g.append("path")
                .attr("d", arc)
                .style("fill", function(d) { return color(d.data.name); });

            svg.append("text")
                .attr("x", (width / 2))
                .attr("y", 0 + (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "medium")
                .text(this.getProperty("title"));

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
        SimplePieChart.prototype.setDataSet  = function(dataSet){
            this.setProperty("items", dataSet);
        };

        SimplePieChart.prototype._getData = function(oldData){
            var dataset = this.getItems();
            var aItems = dataset.getChartData().items;

            if(aItems.length == 0){
                return;
            }

            var data = [];
            var xdomain = dataset.getDimensionValues("x");
            var xlabel = dataset.getLabelForAxis("x");
            var mlabel = dataset.getMeasureNameByIndex();

            xdomain.forEach(function(d){
                var object = {};
                object.name = d.value;
                data.push(object);
            });
            data.forEach(function(d){
               for(var i = 0; i < aItems.length; i++ ){
                   if(aItems[i][xlabel] == d.name){
                       d.value = aItems[i][mlabel];
                   }
               }
            });
            return data;
        };

        SimplePieChart.prototype._shouldResize = function(newWidth,oldWidth, newHeight, oldHeight){
            var raciow = ( newWidth - oldWidth) / oldWidth;
            var racioh = ( newHeight - oldHeight) / oldHeight;

            if (Math.abs(raciow) > 0.1 ||  Math.abs(racioh) > 0.1){
                return true;
            }
            else{
                return false;
            }
        };

        SimplePieChart.prototype._drawLegend = function(svg, width, color){

            var dataset = this.getItems();

            var sNames = [];
            var xdomain = dataset.getDimensionValues("x");
            for(var i = 0; i < xdomain.length; i++){
                sNames.push(xdomain[i]["value"]);
            }

            var legend = svg.selectAll(".legend").remove();
            var legend = svg.selectAll(".legend")
                .data(sNames.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(0," + (45/2 + i * 20) + ")";
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


        SimplePieChart.prototype.onAfterRendering = function () {
            this._drawGraph();
        };

        return SimplePieChart;

    }, true);