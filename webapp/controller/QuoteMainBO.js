sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/Token",
    "../utils/Utility",
    "../utils/CreateColumns"
  ],
  function (JSONModel, Filter, FilterOperator, Fragment, Token, Utility, columns) {
    "use strict";
    return {
      validateMainScreenFilters: function (oData, oView) {
        var sId = this.validateMandatory(oData);
        if (sId) {
          oView.byId(sId).setValueState("Error");
          return false;
        } else {
          return true;
        }
      },

      validateMandatory: function (oData) {
        if (!oData.QuoteType) {
          return "idQuoteType";
        }
        if (!oData.SalesOrg) {
          return "idSalesOrg";
        }
        if (!oData.DC) {
          return "idDistrbutionChannel";
        }
        if (!oData.Division) {
          return "idDivision";
        }
        return false;
      },

      onInputVH: function (
        oControl,
        ColModel,
        oDataModel,
        sFragment,
        globalThis,
        sEntity,
        aFilter
      ) {
        var aCols = ColModel.getData().cols;

        Fragment.load({
          name: sFragment,
          controller: globalThis,
        }).then(
          function name(oFragment) {
            globalThis._oValueHelpDialog = oFragment;
            globalThis.getView().addDependent(globalThis._oValueHelpDialog);

            globalThis._oValueHelpDialog.getTableAsync().then(
              function (oTable) {
                oTable.setModel(oDataModel);
                oTable.setModel(ColModel, "columns");

                /* if (aFilter.length > 0) {
                        if (oTable.bindRows) {
                            oTable.bindAggregation("rows", sEntity);
                        }
                    } else { */
                oTable.bindAggregation("rows", {
                  path: sEntity,
                  filters: aFilter,
                });
                //}

                if (oTable.bindItems) {
                  oTable.bindAggregation("items", sEntity, function () {
                    return new ColumnListItem({
                      cells: aCols.map(function (column) {
                        return new Label({ text: "{" + column.template + "}" });
                      }),
                    });
                  });
                }

                globalThis._oValueHelpDialog.update();
              }.bind(globalThis)
            );

            var oToken = new Token();
            oToken.setKey(oControl.getSelectedKey());
            oToken.setText(oControl.getValue());
            globalThis._oValueHelpDialog.setTokens([oToken]);
            globalThis._oValueHelpDialog.open();
          }.bind(globalThis)
        );
      },

      onValueHelpOkPress: function (aTokens, oControl, globalThis) {
        if (aTokens.length > 0) {
          oControl.setSelectedKey(aTokens[0].getKey());
          oControl.setValue(aTokens[0].getText());
          // oControl.setValue(aTokens[0].getKey());
        }
        globalThis._oValueHelpDialog.close();
      },

      onValueHelpOkNOTextPress: function (aTokens, oControl, globalThis) {
        if (aTokens.length > 0) {
          oControl.setSelectedKey(aTokens[0].getKey());
          oControl.setValue(aTokens[0].getKey());
          // oControl.setValue(aTokens[0].getKey());
        }
        globalThis._oValueHelpDialog.close();
      },

      onValueHelpCancelPress: function (globalThis) {
        globalThis._oValueHelpDialog.close();
      },

      onValueHelpAfterClose: function (globalThis) {
        if (globalThis.getView().getModel("QuoteIDFilterModel")) {
          globalThis.getView().getModel("QuoteIDFilterModel").setData(null);
        }
        globalThis._oValueHelpDialog.destroy();
      },

      validateOnGoPress: function (oModel, sPath, mParameters) {
        return Utility.odataCallFunction(oModel, sPath, mParameters);
      },

      readData: function (oModel, sPath, aParameters) {
        return Utility.odataRead(oModel, sPath, aParameters);
      },

      createColumnModel: function (sRequestedVH) {
        return columns.createColumn(sRequestedVH);
      },
    };
  }
);
