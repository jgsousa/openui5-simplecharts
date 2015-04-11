jQuery.sap.require("sap.ui.core.IconPool");
jQuery.sap.require("testgraph.util.Controller");


testgraph.util.Controller.extend("testgraph.view.List", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf  .testgraph.List
     */
	onInit: function() {

        this.primeiro = true;
        this.getRouter().attachRoutePatternMatched(function(oEvent) {
            if (oEvent.getParameter("name") == "main") {
                // Handle route matched
            }
        }, this);

        var model = new sap.ui.model.json.JSONModel();
        model.loadData("./model/barData1.json", '', false);
        var data = model.getData();
        model.loadData("./model/barData2.json", '', false);
        var data2 = model.getData();

        var oDataset = new openui5.simplecharts.SimpleChartData();

        oDataset.bindDimensions({ items : [ { name: "label", description:"Equipa", axis: "x"},
            {name:"value", description:"Ano", axis:"y"}]});
        oDataset.bindMeasures({ items : [ { name: "value2", description:"Golos", rank: "1"}]});
        oDataset.bindData(data);

        var grafico = new openui5.simplecharts.SimpleBarChart({ title: "Goals by Year"});
        grafico.setDataSet(oDataset);

        var grafico3 = new openui5.simplecharts.SimpleStackedBarChart({ title: "Goals by Year"});
        grafico3.setDataSet(oDataset);

        var grid = this.getView().byId("teste");
        grid.addContent(grafico);

        this.grafico = grafico;
        this.grafico.primeiro = true;
        this.grafico.dataset = oDataset;
        var button = new sap.m.Button({ text: "Switch data", press: [function(){

            var oDataset2 = new openui5.simplecharts.SimpleChartData();
            var oDataset4 = new openui5.simplecharts.SimpleChartData();

            oDataset2.bindDimensions({ items : [ { name: "label", description:"Equipa", axis: "x"},
                {name:"value", description:"Ano", axis:"y"}]});
            oDataset2.bindMeasures({ items : [ { name: "value2", description:"Golos", rank: "1"}]});

            oDataset4.bindDimensions({ items : [ { name: "label", description:"Equipa", axis: "x"} ] });
            oDataset4.bindMeasures({ items : [ { name: "value", description:"Golos", rank: "1"}]});

            if(this.primeiro == true){
                oDataset2.bindData(data2);
                oDataset4.bindData(data4)
                this.primeiro = false;
            }else{
                oDataset2.bindData(data);
                oDataset4.bindData(data3);
                this.primeiro = true;
            }
            this.setDataSet(oDataset2);
            grafico2.setDataSet(oDataset4);
            grafico3.setDataSet(oDataset2);
        }, this.grafico]});

        model = new sap.ui.model.json.JSONModel();
        model.loadData("./model/pieData1.json", '', false);
        var data3 = model.getData();
        model.loadData("./model/pieData2.json", '', false);
        var data4 = model.getData();

        var oDatasetPie = new openui5.simplecharts.SimpleChartData();
        oDatasetPie.bindDimensions({ items : [ { name: "label", description:"Equipa", axis: "x"} ] });
        oDatasetPie.bindMeasures({ items : [ { name: "value", description:"Golos", rank: "1"}]});
        oDatasetPie.bindData(data3);

        var grafico2 = new openui5.simplecharts.SimplePieChart({ title: "Goals by Team"} );
        grafico2.setDataSet(oDatasetPie);

        grid.addContent(grafico2);
        grid.addContent(grafico3);

        grid.addContent(button);

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