sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/Token",
    "../utils/Utility",
    "../utils/CreateColumns",
  ],
  function (
    JSONModel,
    Filter,
    FilterOperator,
    Fragment,
    Token,
    Utility,
    columns
  ) {
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
      getShipToAddress: function (oModel, oView, aData) {
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
        return this.readData(oView.getModel(), sPath, {
          urlParameters: {
            $expand: "QUOTEHEADER,QUOTEITEMS,QUOTEPARTNERS",
          },
        }); /* 
        var aData = oModel.getData();
        aData.action = "SHIPTO";
        aData.QUOTEHEADER.Kunag = aData.kunag = mainScreenData.kunag;
        aData.QUOTEHEADER.Kunwe = aData.kunwe = mainScreenData.kunwe;
        aData.QUOTEHEADER.Auart = aData.auart = mainScreenData.auart;
        aData.QUOTEHEADER.Vkorg = aData.vkorg = mainScreenData.vkorg;
        aData.QUOTEHEADER.Vtweg = aData.vtweg = mainScreenData.vtweg;
        aData.QUOTEHEADER.Spart = aData.spart = mainScreenData.spart;
        aData.QUOTEHEADER.Vbeln = aData.vbeln = "";
        return this.submitData(oView.getModel(), aData); */
      },
      readData: function (oModel, sPath, aParameters) {
        return Utility.odataRead(oModel, sPath, aParameters);
      },
      _updateFilterArray(aFilter, sProperty, sValue) {
        aFilter.push(new Filter(sProperty, FilterOperator.EQ, sValue));
        return aFilter;
      },
      preparePayload: function (oView) {
        var aData = oView.getModel("QuotedetailModel").getData();
        aData.action = "SAVE";
        return aData;
      },
      readItemTableLine: function (oView, object) {
        var oModel = oView.getModel("QuotedetailModel");
        var aData = oModel.getData();
        var items = aData.QUOTEITEMS;
        var header = aData.QUOTEHEADER;
        return this.lineItemRead(oView, header, object);
      },
      lineItemRead: function (oView, header, object) {
        var aPayload = {
          action: "SIMULATE",
          QUOTEHEADER: header,
          QUOTEITEMS: {
            results: [],
          },
        };
        aPayload.QUOTEITEMS.results.push(object);
        return this.submitData(oView.getModel(), aPayload);
      },
      generateFreight: function (oView) {
        var aData = oView.getModel("QuotedetailModel").getData();
        var aPayload = {
          Identifier: aData.QUOTEHEADER.Username,
          ShippingCond: aData.QUOTEHEADER.Vsbed,
          ShipTo: aData.QUOTEHEADER.Kunwe,
          ShipmentDate: aData.QUOTEHEADER.Ketdat,
          CountryCode: aData.QUOTEHEADER.CountryCode,
          NetValue: aData.QUOTEHEADER.Netwr,
          InputItem: [],
        };

        aData.QUOTEITEMS.results.forEach(function (item) {
          aPayload.InputItem.push({
            Identifier: aData.QUOTEHEADER.Username,
            LineItem: item.Posnr,
            Material: item.Matnr,
            MaterialDesc: item.Arktx,
            Plant: item.ItemWerks,
            Quantity: item.Kwmeng,
          });
        });
        return this.submitFreight(
          oView.getModel("freight"),
          "/FreightHeaderSet",
          aPayload
        );
      },
      updateItemTableLine: function (oResponse, oModel, index) {
        var aData = oModel.getData();
        aData.QUOTEITEMS.results[index.slice(-1)] =
          oResponse.QUOTEITEMS.results[0];
        oModel.setData(aData);
      },
      updateItemTableModelValueFields: function (oModel) {
        var aData = oModel.getData();
        aData.QUOTEITEMS.results.forEach(function (item) {
          if (item.OverrideSellprice > 0) {
            item.Netvalue = (item.OverrideSellprice * item.Kwmeng).toString();
          }
        });
        oModel.setData(aData);
      },
      createItemData: function (oData, oModel) {
        var aData = oModel.getData();
        aData.QUOTEITEMS.results.push({
          Posnr: oData.Posnr,
          ItemZzmatSrc: oData.ItemZzmatSrc,
        });
        oModel.setData(aData);
      },
      getTotalNetValue: function (oModel) {
        var aData = oModel.getData();
        var TotalNetValue = 0;
        aData.QUOTEITEMS.results.forEach(function (item) {
          TotalNetValue += parseFloat(item.Netvalue);
        });
        return TotalNetValue;
      },
      submitData: function (oModel, aData) {
        return Utility.odataCreate(oModel, "/QuotationCreateSet", aData);
      },
      submitFreight: function (oModel, sEntitySet, aData) {
        return Utility.odataCreate(oModel, sEntitySet, aData);
      },
    };
  }
);
