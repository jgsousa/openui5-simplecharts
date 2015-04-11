jQuery.sap.declare("testgraph.Component");
jQuery.sap.require("testgraph.MyRouter");
jQuery.sap.require("sap.ui.thirdparty.d3");

sap.ui.core.UIComponent.extend("testgraph.Component", {
    metadata: {
        name: "Testes",
        version: "1.0",
        includes: [],
        dependencies: {
            libs: ["sap.m", "sap.ui.layout"],
            components: []
        },

        rootView: "testgraph.view.App",

        config: {
            resourceBundle: "i18n/messageBundle.properties",
            serviceConfig: {
                name: "",
                serviceUrl: "/sap/opu/odata/sap/"
            }
        },

        routing: {
            config: {
                routerClass:testgraph.MyRouter,
                viewType: "XML",
                viewPath: "testgraph.view",
                targetAggregation: "pages",
                clearTarget: false
            },
            routes: [
                {
                    pattern: "",
                    name: "main",
                    view: "List",
                    targetControl : "idAppControl"
                }
            ]
        }
    },

    init: function () {
        sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

        sap.ui.getCore().loadLibrary("openui5.simplecharts", "../../resources/openui5/simplecharts/");
        jQuery.sap.registerModulePath('bower_component', '../../bower_components');

        var mConfig = this.getMetadata().getConfig();

        // always use absolute paths relative to our own component
        // (relative paths will fail if running in the Fiori Launchpad)
        var oRootPath = jQuery.sap.getModulePath("testgraph");


        // set i18n model
        var i18nModel = new sap.ui.model.resource.ResourceModel({
            bundleUrl: [oRootPath, mConfig.resourceBundle].join("/")
        });
        this.setModel(i18nModel, "i18n");

        var sServiceUrl = mConfig.serviceConfig.serviceUrl;

        //This code is only needed for testing the application when there is no local proxy available, and to have stable test data.
        var bIsMocked = jQuery.sap.getUriParameters().get("responderOn") === "true";
        // start the mock server for the domain model
        if (bIsMocked) {
            this._startMockServer(sServiceUrl);
        }

        // Create and set domain model to the component
        this.setModel(new sap.ui.model.odata.ODataModel(sServiceUrl, true, null, null, null, false, false, true)
            .attachMetadataLoaded(this, this._onMetaLoad));

        // set device model
        var oDeviceModel = new sap.ui.model.json.JSONModel({
            isTouch: sap.ui.Device.support.touch,
            isNoTouch: !sap.ui.Device.support.touch,
            isPhone: sap.ui.Device.system.phone,
            isNoPhone: !sap.ui.Device.system.phone,
            listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
            listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
        });
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.setModel(oDeviceModel, "device");


        this.getRouter().initialize();

    },

    _onMetaLoad : function(oEvent, oObject){
        // Hook for metaload
    },

    _startMockServer: function (sServiceUrl) {
        jQuery.sap.require("sap.ui.core.util.MockServer");
        var oMockServer = new sap.ui.core.util.MockServer({
            rootUri: sServiceUrl
        });

        var iDelay = +(jQuery.sap.getUriParameters().get("responderDelay") || 0);
        sap.ui.core.util.MockServer.config({
            autoRespondAfter: iDelay
        });

        oMockServer.simulate("model/metadata.xml", "model/");
        oMockServer.start();


        sap.m.MessageToast.show("Running in demo mode with mock data.", {
            duration: 2000
        });
    }
});