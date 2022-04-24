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
  function (JSONModel, Filter, FilterOperator, Fragment, Token, Utility,columns) {
    "use strict";
    return {
      submitQuote: function (oView) {
        return this.submitData(oView.getModel(), this.preparePayload(oView));
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

      createColumnModel: function (sRequestedVH) {
        return columns.createColumn(sRequestedVH);
      },
      getVHFilterQuery: function (oFilterQueryData) {
        var aQueryKeys = Object.keys(oFilterQueryData);
        var aFilter = [];
        aQueryKeys.forEach((key, index) => {
          if (oFilterQueryData[key]) {
            aFilter = this._updateFilterArray(
              aFilter,
              key,
              oFilterQueryData[key]
            );
          }
        });
        return aFilter;
      },
      getSoldToAddress: function (oModel, aData) {
        var sPath =
          "/EnterSoldToSet(Kunnr='" +
          aData.Kunnr +
          "',Vkorg='" +
          aData.Vkorg +
          "',Vtweg='" +
          aData.Vtweg +
          "',Spart='" +
          aData.Spart +
          "')";
        return this.readData(oModel, sPath, {
          urlParameters: {
            $expand: "MASTERFIELDSNAV,SHIPTOADDRESSNAV,SOLDTOADDRESSNAV",
          },
        });
      },
      getShipToAddress: function (oModel, aData) {
        var sPath =
          "/QuotationCreateSet(vbeln='" +
          aData.vbeln +
          "',kunag='" +
          aData.kunag +
          "',kunwe='" +
          aData.kunwe +
          "',auart='" +
          aData.auart +
          "',vkorg='" +
          aData.vkorg +
          "',vtweg='" +
          aData.vtweg +
          "',spart='" +
          aData.spart +
          "')";
        return this.readData(oModel, sPath, {
          urlParameters: {
            $expand: "QUOTEHEADER,QUOTEITEMS,QUOTEPARTNERS",
          },
        });
      },
      readData: function (oModel, sPath, aParameters) {
        return Utility.odataRead(oModel, sPath, aParameters);
      },
      _updateFilterArray(aFilter, sProperty, sValue) {
        aFilter.push(new Filter(sProperty, FilterOperator.EQ, sValue));
        return aFilter;
      },
      preparePayload: function (oView) {
        return oView.getModel("QuotedetailModel").getData();
      },
      readItemTableLine:function(oView, object){
          var aData = oView.getModel("QuotedetailModel").getData();
          aData.action = "VALIDATE";
          aData.QUOTEITEMS = object;
         return this.submitData(oView.getModel(), aData);
      },
      submitData: function (oModel, aData) {
        return Utility.odataCreate(oModel, "/QuotationCreateSet", aData);
      },
    };
  }
);
