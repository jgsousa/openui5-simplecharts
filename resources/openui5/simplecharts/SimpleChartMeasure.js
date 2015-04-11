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

sap.ui.define(['jquery.sap.global','sap/ui/core/Element', './library'],
    function(jQuery, Element, library){
        "use strict";

        var SimpleChartMeasure = Element.extend("openui5.simplecharts.SimpleChartMeasure", {
                metadata : {
                    library: "openui5.simplecharts",
                    properties : {
                        "name":         {type: "string", group: "Misc", defaultValue:null},
                        "description" : {type: "string", group: "Misc", defaultValue:null},
                        "rank":         {type: "string", group: "Misc", defaultValue:null}
                    }
                }
            }
        );
        return SimpleChartMeasure;
    }, /* bExport= */ true);