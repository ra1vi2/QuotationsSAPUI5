sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "./QuoteMainBO"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, BO) {
        "use strict";

        return Controller.extend("com.quote.quotations.controller.QuoteMain", {
            onInit: function () {
                this.getView().setModel(new JSONModel(), "this");
                this.getView().getModel("this").setProperty("/IsCreateQuoteSelected", true);

            },

            onSelectHeaderRadioButton: function (oEvent) {
                var iSelectedIndex = oEvent.getParameter("selectedIndex");
                if (iSelectedIndex === 0) {
                    this.getView().getModel("this").setProperty("/IsCreateQuoteSelected", true);
                }
                if (iSelectedIndex === 1) {
                    this.getView().getModel("this").setProperty("/IsCreateQuoteSelected", false);
                }
            },


            onSalesOrgVH: function (oEvent) {
                var oControl = oEvent.getSource();
                var ColModel = new JSONModel({
                    "cols": [{
                        "label": "Sales Office",
                        "template": "vkorg",
                    },
                    {
                        "label": "Sales Office Text",
                        "template": "vtext",
                    }]
                });
                var oDataModel = this.getView().getModel();
                var sFragment = "com.quote.quotations.fragments.SalesOrgVH";
                var globalThis = this;
                var sBindEntity = "/ZOTC_SRCH_HELP_SALES_ORG_DDL";
                BO.onInputVH(oControl, ColModel, oDataModel, sFragment, globalThis, sBindEntity);
            },
            onSalesOrgVHOkPress: function (oEvent) {
                var aTokens = oEvent.getParameter("tokens");
                BO.onValueHelpOkPress(aTokens, this.getView().byId("idSalesOrg"), this);
            },

            onDCVH: function (oEvent) {
                var oControl = oEvent.getSource();
                var ColModel = new JSONModel({
                    "cols": [{
                        "label": "Distribution Channel",
                        "template": "Vtweg",
                    },
                    {
                        "label": "Distribution Channel Text",
                        "template": "vtext",
                    }]
                });
                var oDataModel = this.getView().getModel();
                var sFragment = "com.quote.quotations.fragments.DCVH";
                var globalThis = this;
                var sBindEntity = "/HTvkovSet";
                BO.onInputVH(oControl, ColModel, oDataModel, sFragment, globalThis, sBindEntity);
            },
            onDCVHOkPress:function(){
             var aTokens = oEvent.getParameter("tokens");
                BO.onValueHelpOkPress(aTokens, this.getView().byId("idDistrbutionChannel"), this);
            },
            onDivisionVH: function (oEvent) {
                var oControl = oEvent.getSource();
                var ColModel = new JSONModel({
                    "cols": [{
                        "label": "Division",
                        "template": "Spart",
                    },
                    {
                        "label": "Diviosn Text",
                        "template": "Vtext",
                    }]
                });
                var oDataModel = this.getView().getModel();
                var sFragment = "com.quote.quotations.fragments.DCVH";
                var globalThis = this;
                var sBindEntity = "/HTspaSet";
                BO.onInputVH(oControl, ColModel, oDataModel, sFragment, globalThis, sBindEntity);
            },
            onDivisionVHOkPress:function(){
             var aTokens = oEvent.getParameter("tokens");
                BO.onValueHelpOkPress(aTokens, this.getView().byId("idDivision"), this);
            },
            onValueHelpCancelPress: function () {
                BO.onValueHelpCancelPress(this);
            },
            onValueHelpAfterClose: function () {
                BO.onValueHelpAfterClose(this)
            }
        });
    });
