jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("testgraph2.util.Controller");


testgraph.util.Controller.extend("testgraph2.view.List", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf  .testgraph2.List
     */
	onInit: function() {

        this.primeiro = true;
        this.getRouter().attachRoutePatternMatched(function(oEvent) {
            if (oEvent.getParameter("name") == "main") {
                // Handle route matched
            }
        }, this);
        var map = new openui5.simplecharts.SimpleMapPlot();
        var grid = this.getView().byId("page2");


        var model = new sap.ui.model.json.JSONModel();
        model.loadData("./model/golosData.json", '', false);
        var data = model.getData();

        var oDataset = new openui5.simplecharts.SimpleChartData();
        oDataset.bindDimensions({ items : [
            { name: "lat", description:"Latitude", axis: "x"},
            { name: "long", description:"Longitude", axis:"y"},
            { name: "label", description:"Estadio", axis:"z"}
        ]});

        oDataset.bindMeasures({ items : [ { name: "golos", description:"Golos", rank: "1"}]});
        oDataset.bindData(data);

        map.setDataSet(oDataset);

        grid.addContent(map);

	},

    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf  .testgraph.List
     */
//	onBeforeRendering: function() {
//
//	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf  .testgraph.List
     */
	onAfterRendering: function() {

	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf  .testgraph.List
     */
//	onExit: function() {
//
//	}

    onNavBack : function(){
        window.history.go(-1);
    }
});