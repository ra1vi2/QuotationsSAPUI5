sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "./QuoteMainBO",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, BO, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.quote.quotations.controller.QuoteMain", {
      onInit: function () {
        this.getView().setModel(new JSONModel(), "this");
        this.getView()
          .getModel("this")
          .setProperty("/IsCreateQuoteSelected", true);
        this.getView().setModel(new JSONModel(), "QuoteIDFilterModel");
      },

      onSelectHeaderRadioButton: function (oEvent) {
        var iSelectedIndex = oEvent.getParameter("selectedIndex");
        if (iSelectedIndex === 0) {
          this.getView()
            .getModel("this")
            .setProperty("/IsCreateQuoteSelected", true);
        }
        if (iSelectedIndex === 1) {
          this.getView()
            .getModel("this")
            .setProperty("/IsCreateQuoteSelected", false);
        }
      },
      onSalesOrgVH: function (oEvent) {
        var globalThis = this;
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("SalesOrg"),
          this.getView().getModel(),
          "com.quote.quotations.fragments.SalesOrgVH",
          globalThis,
          "/SalesOrgSet"
        );
      },
      onSalesOrgVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkPress(aTokens, this.getView().byId("idSalesOrg"), this);
      },

      onDCVH: function (oEvent) {
        var globalThis = this;
        var sSelectedSalesOrg = this.byId("idSalesOrg").getSelectedKey();
        var aFilter = [];
        aFilter.push(new Filter("Vkorg", FilterOperator.EQ, sSelectedSalesOrg));
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("DC"),
          this.getView().getModel(),
          "com.quote.quotations.fragments.DCVH",
          globalThis,
          "/HTvkovSet",
          aFilter
        );
      },
      onDCVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkPress(
          aTokens,
          this.getView().byId("idDistrbutionChannel"),
          this
        );
      },
      onDivisionVH: function (oEvent) {
        var globalThis = this;
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("Division"),
          this.getView().getModel(),
          "com.quote.quotations.fragments.Division",
          globalThis,
          "/HTspaSet"
        );
      },
      onDivisionVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkPress(aTokens, this.getView().byId("idDivision"), this);
      },
      onQuoteIDVH: function (oEvent) {
        var globalThis = this;
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("QuoteNumber"),
          this.getView().getModel(),
          "com.quote.quotations.fragments.QuotationNumber",
          globalThis,
          "/VmvaaSet"
        );
      },
      onQuotationIDVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkNOTextPress(
          aTokens,
          this.getView().byId("idQuoteNumber"),
          this
        );
      },
      onValueHelpCancelPress: function () {
        BO.onValueHelpCancelPress(this);
      },
      onValueHelpAfterClose: function () {
        BO.onValueHelpAfterClose(this);
      },
      onSearchQuoteID: function () {
        var aFilter = [];
        var that = this;
        var oFilterQueryData = this.getView()
          .getModel("QuoteIDFilterModel")
          .getData();

        if (oFilterQueryData) {
          var aQueryKeys = Object.keys(oFilterQueryData);
          aQueryKeys.forEach((key, index) => {
            if (oFilterQueryData[key]) {
              aFilter = that._updateFilterArray(
                aFilter,
                key,
                oFilterQueryData[key]
              );
            }
          });

          //this._oValueHelpDialog.setBusy(true);
          this._oValueHelpDialog.getTableAsync().then(
            function (oTable) {
              oTable.setBusy(true);
              if (oTable.bindRows) {
                oTable.bindAggregation("rows", {
                  path: "/VmvaaSet",
                  filters: aFilter,
                });
              }
              this._oValueHelpDialog.update();
              oTable.setBusy(false);
            }.bind(this)
          );
        }
      },
      onGOQuoteMain: function () {
        var oData = [];
        var that = this;
        oData.QuoteType = this.byId("idQuoteType").getSelectedKey();
        oData.SalesOrg = this.byId("idSalesOrg").getSelectedKey();
        oData.DC = this.byId("idDistrbutionChannel").getSelectedKey();
        oData.Division = this.byId("idDivision").getSelectedKey();
        if (BO.validateMainScreenFilters(oData, this.getView())) {
          this.getOwnerComponent().setModel(
            new JSONModel(oData),
            "mainScreenModel"
          );
          var sPath = "ValidateGo";
          BO.validateOnGoPress(this.getView().getModel(), sPath, {
            urlParameters: {
              LvAuart: oData.QuoteType,
              LvVkorg: oData.SalesOrg,
            },
          })
            .then(function (oResponse) {
              that.getView().byId("idQuoteType").setSelectedItemId();
              that
                .getOwnerComponent()
                .setModel(new JSONModel(oResponse), "onGoResponseModel");
              that.getOwnerComponent().getRouter().navTo("detail");
            })
            .fail(function (oError) {
              sap.m.MessageBox.error(oError.value);
            });
        } else {
        }
      },

      _updateFilterArray(aFilter, sProperty, sValue) {
        aFilter.push(new Filter(sProperty, FilterOperator.EQ, sValue));
        return aFilter;
      },
      onChange:function(oEvent){
          oEvent.getSource().setValueState("None");
      }
    });
  }
);
