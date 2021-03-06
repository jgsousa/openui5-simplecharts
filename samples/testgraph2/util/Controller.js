jQuery.sap.declare("testgraph.util.Controller");

sap.ui.core.mvc.Controller.extend("testgraph.util.Controller", {
    getEventBus : function () {
        var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
        return sap.ui.component(sComponentId).getEventBus();
    },

    getRouter : function () {
        return sap.ui.core.UIComponent.getRouterFor(this);
    }
});