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

sap.ui.define(['jquery.sap.global','sap/ui/core/Element', './library', './SimpleChartDimension', './SimpleChartMeasure'],
    function(jQuery, Element, library, SimpleChartDimension, SimpleChartMeasure){
        "use strict";

        /**
         * Constructor for the data of a SimpleChart
         *
         * @class
         * Dataprovider for the Simple Charts
         *
         * @extends sap.ui.core.Element
         *
         * @author João Guilherme Sousa
         * @version 0.1.0
         *
         * @constructor
         * @public
         * @alias openui5.simplecharts.SimpleChartData
         *
         */

        var SimpleChartData = Element.extend("openui5.simplecharts.SimpleChartData", {
                metadata : {
                    library: "openui5.simplecharts",
                    aggregations: {
                        dimensions:   { type: "openui5.simplecharts.SimpleChartDimension", multiple: true, defaultValue:null},
                        measures:   { type: "openui5.simplecharts.SimpleChartMeasure", multiple: true, defaultValue:null},
                        data:   { type: "sap.ui.core.Element", multiple: true, defaultValue:null}
                    }
                }
            }
        );

        /**
         * Attaches dimensions to the dataset. There should be at least one dimension to represent the "x" axis
         * Although X is usually used in XY charts, it can be used for Pie Charts. City, Year, Product are dimensions.
         * Example:
         *              oData = { items : [ { name:"city", description:"City", axis: "x" },
         *                                  { name:"year", description:"Year", axis: "y" } ] }
         * @param oData JSON object, with root an array of "items" of the type SimpleChartDimension
         *              which contain each dimension.
         */
        SimpleChartData.prototype.bindDimensions = function(oData){
            var dimensions = new openui5.simplecharts.SimpleChartDimension({
                name: "{mDimensions>name}",
                axis: "{mDimensions>axis}",
                description:"{mDimensions>description}"
            });
            var model = new sap.ui.model.json.JSONModel();
            model.setData(oData);
            this.setModel(model,"mDimensions");
            this.bindAggregation("dimensions", "mDimensions>/items", dimensions)
        };

        /**
         * A measure is usually a revenue, people count, cost, etc. Usually numeric and continous. Usually you will
         * have one or two measures per chart since they need different axis.
         * Example: oData = { items : [ { name:"avgtemp", description:"Average Temperature", rank: "1" } ] }
         * @param oData JSON object, with root an array of "items" of type SimpleChartMeasure which contain
         *              each measure.
         */
        SimpleChartData.prototype.bindMeasures = function(oData){
            var measures = new openui5.simplecharts.SimpleChartMeasure({
                name: "{mMeasures>name}",
                rank: "{mMeasures>rank}",
                description: "{mMeasures>description}"
            });
            var model = new sap.ui.model.json.JSONModel();
            model.setData(oData);
            this.setModel(model,"mMeasures");
            this.bindAggregation("measures", "mMeasures>/items", measures);
        };

        /**
         * The actual data. A JSON object with key-value pair that represent the dimensions and measures. For example
         * for dimensions: City and Year and Measure "average temperature" the JSON object would be something like
         * oData = { items : [ { city: "New York", year:"2014", avgtemp: "23" } , ... } ] }
         * @param oData
         */
        SimpleChartData.prototype.bindData = function(oData){
            var oItemTemplate = new sap.ui.core.Element();
            if(!oData || !oData.items || oData.items.length == 0){
                return;
            }
            var keys = Object.keys(oData.items[0]);
            var wanted = [];
            var dimensions = this.getAggregation("dimensions");
            for(var i = 0; i < dimensions.length; i++){
                wanted.push(dimensions[i].getProperty("name"));
            }
            var measures = this.getAggregation("measures");
            for(var i = 0; i < measures.length; i++){
                wanted.push(measures[i].getProperty("name"));
            }

            for(var i in keys){
                if (wanted.indexOf(keys[i]) > -1) {
                    var template = new sap.ui.core.CustomData({key: keys[i]});
                    template.bindProperty("value", keys[i]);
                    oItemTemplate.addCustomData(template);
                }
            }
            var model = new sap.ui.model.json.JSONModel();
            model.setData(oData);
            oItemTemplate.setModel(model);
            this.setModel(model);
            this.bindAggregation("data","/items",oItemTemplate);
        };

        /**
         * Switches the model for the data of the dataset. Doesn't apply to dimensions or measures.
         * @param oModel
         */
        SimpleChartData.prototype.setDataModel = function(oModel){
            this.setModel(oModel, "mData");
            oModel.updateBindings();
        };

        /**
         * Because the data is dynamic I have to use CustomData which makes getting the data a bit
         * difficult, this flattens the data.
         * @returns {*}
         */
        SimpleChartData.prototype.getChartData = function(){
            var data = this.getData();
            if(data.length == 0){
                return null;
            }
            var output = { items: []};
            for(var i = 0; i < data.length; i++){
                var custom = data[i].getCustomData();
                var item = '{ ';
                for(var j in custom){
                    var cdata = custom[j];
                    if(j > 0){
                        item = item + ',';
                    }
                    item = item + '"' + cdata.getProperty("key") + '":"' + cdata.getProperty("value") + '"';
                }
                item = item + " }";
                output.items.push(JSON.parse(item));
            }
            return output;
        };

        /**
         * Get the label for the dimension that corresponds to the axis.
         * @param axis x or y
         * @returns {*} the name attribute of the dimension
         */
        SimpleChartData.prototype.getLabelForAxis = function(axis){
            var dimensions = this.getAggregation("dimensions");
            for(var i in dimensions){
                if(dimensions[i].mProperties["axis"] == axis){
                    return dimensions[i].mProperties["name"];
                }
            }
        };

        /**
         * Returns number of dimensions.
         * @returns {Number}
         */
        SimpleChartData.prototype.getNumberDimensions = function(){
            return this.getAggregation("dimensions").length;
        };

        /**
         * Returns the description for axis X or Y
         * @param axis x or y
         * @returns {*}
         */
        SimpleChartData.prototype.getDimensionDescriptionForAxis = function(axis){
            if(!axis){
                axis = "x";
            }
            var dimensions = this.getAggregation("dimensions")
            for(var i in dimensions){
                if(dimensions[i].mProperties["axis"] == axis){
                    return dimensions[i].mProperties["description"];
                }
            }
        };

        /**
         * Returns the name property of the selected measures. The index begins at zero, not one.
         * @param index Defaults to zero if not supplied
         * @returns {*}
         */
        SimpleChartData.prototype.getMeasureNameByIndex = function(index){
            if(!index){
                index = 0;
            }
            var measure = this.getAggregation("measures")[index];
            return measure.mProperties["name"];
        };

        /**
         * Returns the description property of the selected measure
         * @param index Defaults to zero if not supplied
         * @returns {*}
         */
        SimpleChartData.prototype.getMeasureDescriptionByIndex = function(index){
            if(!index){
                index = 0;
            }
            var measure = this.getAggregation("measures")[index];
            return measure.mProperties["description"];
        };

        SimpleChartData.prototype.getDimensionValues = function(axis){
            var oDimensions = this.getAggregation("dimensions");
            var oData = this.getChartData().items;

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


        return SimpleChartData;
    }, /* bExport= */ true);