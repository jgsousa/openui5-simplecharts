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

sap.ui.define(['jquery.sap.global'],
    function(jQuery) {
        "use strict";


        /**
         * @class SimpleMapPlot renderer.
         * @static
         */
        var SimpleMapPlotRenderer = {
        };


        /**
         * Renders the HTML for the given control, using the provided {@link openui5.simplecharts.SimpleMapPlot}.
         *
         * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
         * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
         */
        SimpleMapPlotRenderer.render = function (oRm, oControl) {
            oRm.write("<div ");
            oRm.write("id=\"" + oControl.mProperties["id"] + "\" ");

            oRm.writeControlData(oControl);
            oRm.addStyle("width",oControl.getWidth());
            oRm.addStyle("height",oControl.getHeight());
            oRm.writeStyles();
            oRm.write(">");
            oRm.write("</div>");

        };


        return SimpleMapPlotRenderer;

    }, /* bExport= */ true);