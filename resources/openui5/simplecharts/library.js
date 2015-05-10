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

/**
 * OpenUI5 Simple Charts
 * @namespace
 * @name openui5
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/library'], // library dependency
    function(jQuery) {

        "use strict";

        /**
         * Simplecharts controls library.
         *
         * @namespace
         * @name openui5.simplecharts
         * @author João Guilherme Sousa
         * @version 0.1.0
         * @public
         */

            // delegate further initialization of this library to the Core
        sap.ui.getCore().initLibrary({
            name : "openui5.simplecharts",
            version: "1.29.0-20150510140227.0+sha.477ed82",
            dependencies : ["sap.ui.core"],
            types: [],
            interfaces: [],
            controls: [
                "openui5.simplecharts.SimpleBarChart",
                "openui5.simplecharts.SimplePieChart",
                "openui5.simplecharts.SimpleStackedBarChart",
                "openui5.simplecharts.SimpleLineChart",
                "openui5.simplecharts.SimpleMapPlot"
            ],
            elements: [
                "openui5.simplecharts.SimpleChartData",
                "openui5.simplecharts.SimpleChartDimension",
                "openui5.simplecharts.SimpleChartMeasure"
            ]
        });


        return openui5.simplecharts;

    }, /* bExport= */ false);
