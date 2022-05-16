sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "./QuoteDetailBO",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/ui/core/BusyIndicator",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/routing/History",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    BO,
    Fragment,
    syncStyleClass,
    BusyIndicator,
    Dialog,
    Button,
    Text,
    History
  ) {
    "use strict";

    return Controller.extend("com.quote.quotations.controller.QuoteMain", {
      onInit: function () {
        this.getOwnerComponent()
          .getRouter()
          .getRoute("detail")
          .attachPatternMatched(this._onPatternMatchedDetail, this);
      },
      _onPatternMatchedDetail: function (oEvent) {
        // this.byId("idButtonCreateQuote").setVisible(true);
        // this.byId("idButtonCreateOrder").setVisible(false);
        // this.byId("idButtonCreateOrderFore").setVisible(false);
        // this.byId("genrateEQuoteLinkbtn").setVisible(false);
        // this.byId("emailEQuoteButton").setVisible(false);
        // this.byId("idHeaderFormOrderLink").setVisible(false);
        // this.byId("idHeaderFormOrderLinklbl").setVisible(false);

        this.getView().setModel(new JSONModel({}), "TotalValues");
        this.getView().setModel(new JSONModel({}), "generatedFreight");
        this.getView().getModel("generatedFreight").setData();
        var oDetailData = {
          QUOTEHEADER: {},
        };
        var oGoModel = this.getOwnerComponent().getModel("onGoResponseModel");
        if (oGoModel) {
          var oGoModelData = oGoModel.getData();
          oDetailData.QUOTEHEADER.Angdt = oGoModelData.ValidFrom;
          oDetailData.QUOTEHEADER.Bnddt = oGoModelData.ValidTo;
        } else {
          //this.onNavBack();
        }
        this.getView().setModel(
          new JSONModel(oDetailData),
          "Quotedetailsheader"
        );
        this.getView().setModel(new JSONModel(oDetailData), "QuotedetailModel");
        this.getView().setModel(
          new JSONModel({
            EditPartnerTable: false,
          }),
          "this"
        );
        this.getView().getModel("this").setProperty("/CurrViewMode", "EDIT");
        this.getView()
          .getModel("this")
          .setProperty("/CurrButtonViewMode", "CREATE_QUOTE");
      },
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          history.go(-1);
        } else {
          this.getOwnerComponent()
            .getRouter()
            .navTo("RouteQuoteMain", {}, true);
        }
      },

      onSoldToVH: function (oEvent) {
        var globalThis = this;
        var oMainScreenModel = this.getOwnerComponent().getModel(
          "mainScreenModel"
        );
        var oData = {},
          aFilter = [];

        if (oMainScreenModel) {
          oData.Vkorg = oMainScreenModel.getData().SalesOrg;
          oData.Vtweg = oMainScreenModel.getData().DC;
          oData.Spart = oMainScreenModel.getData().Division;

          aFilter.push(new Filter("Vkorg", FilterOperator.EQ, oData.Vkorg));
          aFilter.push(new Filter("Vtweg", FilterOperator.EQ, oData.Vtweg));
          aFilter.push(new Filter("Spart", FilterOperator.EQ, oData.Spart));
        }
        this.getView().setModel(new JSONModel(oData), "SoldToFilter");
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("SoldTo"),
          this.getView().getModel(),
          "com.quote.quotations.object.fragments.SoldTo",
          globalThis,
          "/DebisSet",
          aFilter
        );
      },
      onSoldToVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkNOTextPress(
          aTokens,
          this.getView().byId("idQuoteDetailHeaderFormSoldTo"),
          this
        );
        this.onChangeSoldTo();
      },
      onShipToVH: function (oEvent) {
        var globalThis = this;
        var oMainScreenModel = this.getOwnerComponent().getModel(
          "mainScreenModel"
        );
        var oData = {},
          aFilter = [];

        if (oMainScreenModel) {
          oData.Vkorg = oMainScreenModel.getData().SalesOrg;
          oData.Vtweg = oMainScreenModel.getData().DC;
          oData.Spart = oMainScreenModel.getData().Division;

          aFilter.push(new Filter("Vkorg", FilterOperator.EQ, oData.Vkorg));
          aFilter.push(new Filter("Vtweg", FilterOperator.EQ, oData.Vtweg));
          aFilter.push(new Filter("Spart", FilterOperator.EQ, oData.Spart));
        }

        this.getView().setModel(new JSONModel(oData), "ShipToFilter");
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("ShipTo"),
          this.getView().getModel(),
          "com.quote.quotations.object.fragments.ShipTo",
          globalThis,
          "/DebisSet"
        );
      },
      onShipToVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkNOTextPress(
          aTokens,
          this.getView().byId("idQuoteDetailHeaderFormShipTo"),
          this
        );
        this.onChangeShipTo();
      },
      onSearchSoldTo: function () {
        this._filterVHTable("SoldToFilter", "/DebisSet");
      },
      onSearchShipTo: function () {
        this._filterVHTable("ShipToFilter", "/DebisSet");
      },
      onSearchMaterialNumber: function () {
        this._filterVHTable("MaterialFilter", "/ItemMaterialNumberSet");
      },
      onChangeSoldTo: function () {
        this._setAppBusy(true);
        this.getView().getModel("generatedFreight").setData();
        var soldTo = this.byId("idQuoteDetailHeaderFormSoldTo").getValue();

        var oMainScreenModel = this.getOwnerComponent().getModel(
          "mainScreenModel"
        );
        var Vkorg = oMainScreenModel.getData().SalesOrg;
        var Vtweg = oMainScreenModel.getData().DC;
        var Spart = oMainScreenModel.getData().Division;
        var that = this;
        BO.getSoldToAddress(this.getView().getModel(), {
          Kunnr: soldTo,
          Vkorg: Vkorg,
          Vtweg: Vtweg,
          Spart: Spart,
        })
          .then(function (oResponse) {
            that
              .getView()
              .byId("idSoldToAddress")
              .setText(
                oResponse.SOLDTOADDRESSNAV.Name +
                  oResponse.SOLDTOADDRESSNAV.Street +
                  oResponse.SOLDTOADDRESSNAV.City
              );
            that
              .getView()
              .setModel(
                new JSONModel(oResponse.SHIPTOADDRESSNAV),
                "shipToAddressFromSoldTo"
              );
            that._setAppBusy(false);
            //that.getView().setModel(new JSONModel(oResponse.MASTERFIELDSNAV), "masterdatamodel");
            that.openShipToPopUp();
            //that.setMasterDataFields();
          })
          .fail(function (oError) {
            sap.m.MessageBox.error(
              JSON.parse(oError.responseText).error.message.value
            );
            var aData = that.getView().getModel("QuotedetailModel").getData();
            if (aData.QUOTEHEADER) {
              aData.QUOTEHEADER = {};
            }
            var headerdata = that
              .getView()
              .getModel("Quotedetailsheader")
              .getData();
            if (headerdata) {
              headerdata = {};
            }
            that.getView().getModel("Quotedetailsheader").setData(headerdata);
            if (aData.QUOTEPARTNERS) {
              aData.QUOTEPARTNERS.results = [];
            }
            if (aData.QUOTEITEMS) {
              aData.QUOTEITEMS.results = [];
            }
            that.getView().getModel("QuotedetailModel").setData(aData);
            that.getView().getModel("generatedFreight").setData();
            that._setAppBusy(false);
          });
      },
      openShipToPopUp: function () {
        var oView = this.getView();

        if (!this._pDialog) {
          this._pDialog = Fragment.load({
            id: oView.getId(),
            name: "com.quote.quotations.object.fragments.ShipToSelectDialog",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }

        this._pDialog.then(
          function (oDialog) {
            this._configDialog(oDialog);
            oDialog.open();
          }.bind(this)
        );
      },
      _configDialog: function (oDialog) {
        syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
      },
      handleShipToSelectDialogClose: function (oEvent) {
        // reset the filter
        var aContexts = oEvent.getParameter("selectedContexts");
        if (aContexts && aContexts.length) {
          var sPath = aContexts[0].sPath;
          var oSelectedObject = this.getView()
            .getModel("shipToAddressFromSoldTo")
            .getObject(sPath);
          this.getView()
            .byId("idQuoteDetailHeaderFormShipTo")
            .setSelectedKey(oSelectedObject.Kunnr);
          this.getView()
            .byId("idQuoteDetailHeaderFormShipTo")
            .setValue(oSelectedObject.Kunnr);
          this.getView()
            .byId("idShipToAddress")
            .setText(
              oSelectedObject.Name +
                oSelectedObject.Street +
                oSelectedObject.City
            );
        }
        this.onChangeShipTo();
      },
      onChangeShipTo: function () {
        this.getView().getModel("generatedFreight").setData();
        var soldTo = this.byId("idQuoteDetailHeaderFormSoldTo").getValue();
        var shipTo = this.byId("idQuoteDetailHeaderFormShipTo").getValue();
        var oMainScreenModel = this.getOwnerComponent().getModel(
          "mainScreenModel"
        );
        var Vkorg = oMainScreenModel.getData().SalesOrg;
        var Vtweg = oMainScreenModel.getData().DC;
        var Spart = oMainScreenModel.getData().Division;
        var auart = oMainScreenModel.getData().QuoteType;
        var that = this;
        BO.getShipToAddress(
          this.getView().getModel("QuotedetailModel"),
          this.getView(),
          {
            vbeln: "",
            kunag: soldTo,
            kunwe: shipTo,
            auart: auart,
            vkorg: Vkorg,
            vtweg: Vtweg,
            spart: Spart,
          }
        )
          .then(function (oResponse) {
            /* that.getView().byId("idShipToAddress")
                         .setText(
                             oResponse.SOLDTOADDRESSNAV.Name +
                             oResponse.SOLDTOADDRESSNAV.Street +
                             oResponse.SOLDTOADDRESSNAV.City);
                 }); */
            /* if (oResponse.QUOTEITEMS.results.length === 0) {
              oResponse.QUOTEITEMS.results.push({
                Posnr: "10",
                ItemZzmatSrc: oResponse.QUOTEHEADER.HeaderZzmatSrc,
              });
            } */

            var oGoModel = that
              .getOwnerComponent()
              .getModel("onGoResponseModel");
            if (oGoModel) {
              var oGoModelData = oGoModel.getData();
              oResponse.QUOTEHEADER.Angdt = oGoModelData.ValidFrom;
              oResponse.QUOTEHEADER.Bnddt = oGoModelData.ValidTo;
            }
            that.getView().getModel("QuotedetailModel").setData(oResponse);
          })
          .fail(function (oError) {
            sap.m.MessageBox.error(
              JSON.parse(oError.responseText).error.message.value
            );
            var aData = that.getView().getModel("QuotedetailModel").getData();
            if (aData.QUOTEHEADER) {
              aData.QUOTEHEADER = {};
            }
            var headerdata = that
              .getView()
              .getModel("Quotedetailsheader")
              .getData();
            if (headerdata) {
              headerdata = {};
            }
            that.getView().getModel("Quotedetailsheader").setData(headerdata);
            if (aData.QUOTEPARTNERS) {
              aData.QUOTEPARTNERS.results = [];
            }
            if (aData.QUOTEITEMS) {
              aData.QUOTEITEMS.results = [];
            }
            that.getView().getModel("QuotedetailModel").setData(aData);
            that.getView().getModel("generatedFreight").setData();
          });
      },
      onValueHelpCancelPress: function () {
        BO.onValueHelpCancelPress(this);
      },
      onValueHelpAfterClose: function () {
        BO.onValueHelpAfterClose(this);
      },
      setMasterDataFields: function () {
        var mastermodel = this.getView().getModel("masterdatamodel"),
          masterData = mastermodel.getData(),
          quoteDetailModel = this.getView().getModel("Quotedetailsheader"),
          quoteDetailData = quoteDetailModel.getData();

        quoteDetailData.masterdata = masterData;
        mastermodel.setData(quoteDetailData);
      },
      onPlantVH: function (oEvent) {
        var globalThis = this;
        this.currentPlantLine = oEvent.getSource();
        var oMainScreenModel = this.getOwnerComponent().getModel(
          "mainScreenModel"
        );
        var oData = {},
          aFilter = [];

        if (oMainScreenModel) {
          oData.Vkorg = oMainScreenModel.getData().SalesOrg;
          oData.Vtweg = oMainScreenModel.getData().DC;
          oData.Spart = oMainScreenModel.getData().Division;

          aFilter.push(new Filter("Vkorg", FilterOperator.EQ, oData.Vkorg));
          aFilter.push(new Filter("Vtweg", FilterOperator.EQ, oData.Vtweg));
        }

        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("Plant"),
          this.getView().getModel(),
          "com.quote.quotations.object.fragments.PlantVH",
          globalThis,
          "/HeaderPlantSet",
          aFilter
        );
      },
      onPlantVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkPress(aTokens, this.currentPlantLine, this);
      },

      onRejctionReasonVH: function (oEvent) {
        var globalThis = this;
        this.currentRejectionReasonLine = oEvent.getSource();
        var oMainScreenModel = this.getOwnerComponent().getModel(
          "mainScreenModel"
        );
        var oData = {},
          aFilter = [];

        if (oMainScreenModel) {
          oData.VKORG = oMainScreenModel.getData().SalesOrg;
          oData.AUART = oMainScreenModel.getData().QuoteType;
          var ABGRU_blank = "";

          aFilter.push(new Filter("VKORG", FilterOperator.EQ, oData.VKORG));
          aFilter.push(new Filter("AUART", FilterOperator.EQ, oData.AUART));
          aFilter.push(new Filter("ABGRU", FilterOperator.EQ, ABGRU_blank));
        }
        this.getView().setModel(new JSONModel(oData), "RejectionReasonFilter");
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("RejectionReason"),
          this.getView().getModel(),
          "com.quote.quotations.object.fragments.RejectionReasonVH",
          globalThis,
          "/ReasonforRejectionSet",
          aFilter
        );
      },
      onSearchRejectionReason: function () {
        this._filterVHTable("RejectionReasonFilter", "/ReasonforRejectionSet");
      },
      onRejectionReasonVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkPress(aTokens, this.currentRejectionReasonLine, this);
      },
      onMaterialSourceVH: function (oEvent) {
        var globalThis = this;
        this.currentMatSourceLine = oEvent.getSource();
        // this.getView().setModel(new JSONModel(), "ShipToFilter");
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("MaterialSource"),
          this.getView().getModel(),
          "com.quote.quotations.object.fragments.MaterialSourceVH",
          globalThis,
          "/MaterialSourceSet"
        );
      },
      onInco1VHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkPress(
          aTokens,
          this.getView().byId("idQuickHeaderPlant"),
          this
        );
      },
      onIncoTerms1VH: function (oEvent) {
        var globalThis = this;
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("IncoTerms1"),
          this.getView().getModel(),
          "com.quote.quotations.object.fragments.IncoTerms1VH",
          globalThis,
          "/IncotermsSet"
        );
      },
      onMaterialSourceVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkPress(aTokens, this.currentMatSourceLine, this);
        this.currentMaterialSourceValue = this.currentMatSourceLine.getValue();
      },
      onMaterialVH: function (oEvent) {
        var globalThis = this;
        var oMainScreenModel = this.getOwnerComponent().getModel(
          "mainScreenModel"
        );
        var oData = {};
        var aFilter = [];
        if (oMainScreenModel) {
          oData.Vkorg = oMainScreenModel.getData().SalesOrg;
          oData.Vtweg = oMainScreenModel.getData().DC;

          aFilter.push(new Filter("Vkorg", FilterOperator.EQ, oData.Vkorg));
          aFilter.push(new Filter("Vtweg", FilterOperator.EQ, oData.Vtweg));
        }
        this.getView().setModel(new JSONModel(oData), "MaterialFilter");
        this.currentMaterialLine = oEvent.getSource();
        BO.onInputVH(
          oEvent.getSource(),
          BO.createColumnModel("MaterialNumber"),
          this.getView().getModel(),
          "com.quote.quotations.object.fragments.MaterialNumberVH",
          globalThis,
          "/ItemMaterialNumberSet",
          aFilter
        );
      },
      onMaterialVHOkPress: function (oEvent) {
        var aTokens = oEvent.getParameter("tokens");
        BO.onValueHelpOkNOTextPress(aTokens, this.currentMaterialLine, this);
      },
      _filterVHTable: function (sFilterModel, sEntitySet) {
        var aFilter = [];
        var oFilterQueryData = this.getView().getModel(sFilterModel).getData();

        if (oFilterQueryData) {
          aFilter = BO.getVHFilterQuery(oFilterQueryData);
          //this._oValueHelpDialog.setBusy(true);
          this._oValueHelpDialog.getTableAsync().then(
            function (oTable) {
              oTable.setBusy(true);
              if (oTable.bindRows) {
                oTable.bindAggregation("rows", {
                  path: sEntitySet,
                  filters: aFilter,
                });
              }
              this._oValueHelpDialog.update();
              oTable.setBusy(false);
            }.bind(this)
          );
        }
      },
      onAddPartnerFunction: function (oEvent) {
        var oTable = this.getView().byId("idPartnerFunctionTable");
        this.getView().getModel("this").setProperty("/EditPartnerTable", true);
        var oDetailModel = this.getView().getModel("QuotedetailModel");
        var oDetailData = oDetailModel.getData();
        oDetailData.QUOTEPARTNERS.results.push({
          Auart: "",
          BuPartner: "",
          City1: "",
          Knref: "",
          Kunag: "",
          Kunwe: "",
          Name1: "",
          PartnerExt: "",
          Parvw: "",
          PostCode1: "",
          Spart: "",
          Street: "",
          Vbeln: "",
          Vkorg: "",
          Vtweg: "",
        });
        oDetailModel.setData(oDetailData);
      },
      onDeletePartnerFunction: function (oEvent) {
        var oDetailModel = this.getView().getModel("QuotedetailModel");
        var oDetailData = oDetailModel.getData();

        var index = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getSelectedIndex();
        oDetailData.QUOTEPARTNERS.results.splice(index, 1);
        oDetailModel.setData(oDetailData);
      },
      onEditPartnerFunction: function (oEvent) {
        var index = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getSelectedIndex();
        var thisModel = this.getView().getModel("this");
        if (thisModel.getProperty("/EditPartnerTable")) {
          this.getView()
            .getModel("this")
            .setProperty("/EditPartnerTable", false);
        } else {
          this.getView()
            .getModel("this")
            .setProperty("/EditPartnerTable", true);
        }
      },
      onSubmitItemQuantity: function (oEvent) {
        var oContext = oEvent
          .getSource()
          .getParent()
          .getBindingContext("QuotedetailModel");
        var sPath = oContext.getPath();
        var oSelectedObject = oContext.getObject(sPath);
        if (!oSelectedObject.Matnr) {
          oEvent
            .getSource()
            .getParent()
            .getAggregation("cells")[1]
            .setValueState("Error");
        } else if (!oSelectedObject.Kwmeng) {
          oEvent
            .getSource()
            .getParent()
            .getAggregation("cells")[4]
            .setValueState("Error");
        } else {
          this._setAppBusy(true);
          BO.readItemTableLine(this.getView(), oSelectedObject)
            .then(
              function (oResponse) {
                var oModel = this.getView().getModel("QuotedetailModel");
                BO.updateItemTableLine(oResponse, oModel, sPath);
                BO.updateItemTableModelValueFields(oModel);
                this.updateNetValue(oModel);
                this.updateTotalValues();
                this._setAppBusy(false);
              }.bind(this)
            )
            .fail(
              function (oError) {
                sap.m.MessageBox.error(
                  JSON.parse(oError.responseText).error.message.value
                );
                this._setAppBusy(false);
              }.bind(this)
            );
        }
      },
      onSubmitQuote: function () {
        this._setAppBusy(true);
        var that = this;
        BO.submitQuote(this.getView())
          .then(function (oResponse) {
            // alert("Quotation : "+oResponse.vbeln+" created successfully ");
            sap.ushell.Container.setDirtyFlag(false);
            var dialog = new Dialog({
              title: "Quotation Creation",
              type: "Message",
              state: "Success",
              content: new Text({
                text:
                  "Quotation : " + oResponse.vbeln + " created successfully ",
              }),
              beginButton: new Button({
                text: "Ok",
                press: function () {
                  dialog.close();
                },
              }),
              afterClose: function () {
                dialog.destroy();
              },
            });
            dialog.open();
            //alert("success");
            var oDetailModel = that.getView().getModel("QuotedetailModel");
            var oDetailData = oDetailModel.getData();
            oDetailData.QUOTEHEADER.Vbeln = oResponse.vbeln;
            oDetailData.vbeln = oResponse.vbeln;
            oDetailModel.setData(oDetailData);
            // that.byId("idButtonCreateQuote").setVisible(false);
            // that.byId("idButtonCreateOrder").setVisible(true);
            // that.byId("idButtonCreateOrderFore").setVisible(true);
            // that.byId("genrateEQuoteLinkbtn").setVisible(true);
            // that.byId("emailEQuoteButton").setVisible(true);
            that
              .getView()
              .getModel("this")
              .setProperty("/CurrViewMode", "DISPLAY");
            that
              .getView()
              .getModel("this")
              .setProperty("/CurrButtonViewMode", "DISPLAY");

            that.getQuoteDetails(oResponse.vbeln);
            that.vbeln = oResponse.vbeln;
            that._setAppBusy(false);
          })
          .fail(function (oError) {
            that._setAppBusy(false);
            var dialog = new Dialog({
              title: "Quotation Creation",
              type: "Message",
              state: "Error",
              content: new Text({
                text: JSON.parse(oError.responseText).error.message.value,
              }),
              beginButton: new Button({
                text: "Ok",
                press: function () {
                  dialog.close();
                },
              }),
              afterClose: function () {
                dialog.destroy();
              },
            });
            dialog.open();
          });
      },
      getQuoteDetails: function (sQuoteNumber) {
        this._setAppBusy(true);
        BO.readQuote(this.getView().getModel(), sQuoteNumber).then(
          function (oResponse) {
            this.getView().getModel("QuotedetailModel").setData(oResponse);
            this._setAppBusy(false);
          }.bind(this)
        );
      },

      onCreateOrder: function () {
        this._setAppBusy(true);
        var that = this;
        BO.submitOrder(this.getView())
          .then(function (oResponse) {
            that.byId("idHeaderFormOrderLink").setVisible(true);
            that.byId("idHeaderFormOrderLinklbl").setVisible(true);
            that
              .byId("idHeaderFormOrderLink")
              .setText(oResponse.QUOTEHEADER.SalesOrder);
            that
              .byId("idHeaderFormOrderLink")
              .setHref(
                "https://vhpthds4ci.sap.partstown.com:44300/sap/bc/ui2/flp#SalesOrder-display?SalesOrder=" +
                  oResponse.QUOTEHEADER.SalesOrder
              );
            var dialog = new Dialog({
              title: "Order Creation",
              type: "Message",
              state: "Success",
              content: new Text({
                text:
                  "Order : " +
                  oResponse.QUOTEHEADER.SalesOrder +
                  " created successfully ",
              }),
              beginButton: new Button({
                text: "Ok",
                press: function () {
                  dialog.close();
                },
              }),
              afterClose: function () {
                dialog.destroy();
              },
            });
            dialog.open();
            //alert("success");
            that.byId("idButtonCreateQuote").setVisible(false);
            that.byId("idButtonCreateOrder").setVisible(true);
            that.byId("idButtonCreateOrderFore").setVisible(true);
            that.byId("genrateEQuoteLinkbtn").setVisible(true);
            that.byId("emailEQuoteButton").setVisible(true);
            that._setAppBusy(false);
          })
          .fail(function (oError) {
            var dialog = new Dialog({
              title: "Order Creation",
              type: "Message",
              state: "Error",
              content: new Text({
                text: JSON.parse(oError.responseText).error.message.value,
              }),
              beginButton: new Button({
                text: "Ok",
                press: function () {
                  dialog.close();
                },
              }),
              afterClose: function () {
                dialog.destroy();
              },
            });
            dialog.open();
            that._setAppBusy(false);
          });
      },
      onCreateOrderForeground: function () {
        var that = this;
        BO.getSalesDocForQuote(this.getView()).then(function (oResponse) {
          that.navToSalesOrder(oResponse);
        });
      },
      navToSalesOrder: function (oResponse) {
        location.href =
          "https://vhpthds4ci.sap.partstown.com:44300/sap/bc/ui2/flp?sap-client=110&sap-language=EN#SalesOrder-create?P_TRVOG=0&P_VBTYP=0&P_AUART=" +
          oResponse.AUART +
          "&P_VGBEL=" +
          oResponse.VBELN;

        /*
         var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
         var sHashUrl = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "SalesOrder",
					action: "create"
				},
				params: {
                    P_TRVOG : "0",
                    P_VBTYP : "0",
                    P_AUART : oResponse.AUART,
                    P_VGBEL : oResponse.VBELN
                }
			}));
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: sHashUrl
				}
			});*/
        //P_TRVOG=0&P_VBTYP=0&P_AUART=ZORD&P_VGBEL=100000364
      },
      onAddLineItem: function () {
        var oDetailModel = this.getView().getModel("QuotedetailModel");
        var oDetailData = oDetailModel.getData();
        var availableIndex = oDetailData.QUOTEITEMS.results.length;
        var posnr = (availableIndex + 1) * 10;
        var oData = {
          Posnr: posnr.toString(),
          ItemZzmatSrc: this.byId("idMaterialSource").getSelectedKey(),
        };
        BO.createItemData(oData, oDetailModel);
      },
      onDeleteLineItem: function (oEvent) {
        var oDetailModel = this.getView().getModel("QuotedetailModel");
        var oDetailData = oDetailModel.getData();

        var index = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getSelectedIndex();
        oDetailData.QUOTEITEMS.results.splice(index, 1);
        oDetailData.QUOTEHEADER.Netwr = BO.getTotalNetValue(
          oDetailModel
        ).toString();
        oDetailModel.setData(oDetailData);
        this.updateTotalValues();
      },
      onEnterOverridePrice: function (oEvent) {
        var oContext = oEvent
          .getSource()
          .getParent()
          .getBindingContext("QuotedetailModel");
        var sPath = oContext.getPath();
        var oSelectedObject = oContext.getObject(sPath);
        if (!oSelectedObject.Matnr) {
          oEvent
            .getSource()
            .getParent()
            .getAggregation("cells")[1]
            .setValueState("Error");
        } else if (!oSelectedObject.Kwmeng) {
          oEvent
            .getSource()
            .getParent()
            .getAggregation("cells")[4]
            .setValueState("Error");
        } else {
          var oModel = this.getView().getModel("QuotedetailModel");
          BO.updateItemTableModelValueFields(oModel);
          this.updateNetValue(oModel);
          this.updateTotalValues();
        }
      },
      updateNetValue: function (oModel) {
        var oDetailData = oModel.getData();
        oDetailData.QUOTEHEADER.Netwr = BO.getTotalNetValue(oModel).toString();
        oModel.setData(oDetailData);
      },
      handleLineItemUpdate: function (oResponse, sPath) {},
      onGenerateFreightEstimate: function () {
        this._setAppBusy(true);
        BO.generateFreight(this.getView())
          .then(
            function (oResponse) {
              var aData = this.getView().getModel("QuotedetailModel").getData();

              var data = [];
              if (aData.QUOTEHEADER.CountryCode === "US") {
                if (oResponse.UPSOutput.results.length > 0) {
                  oResponse.UPSOutput.results.forEach(function (item) {
                    data.push({
                      ServiceCode: item.ServiceCode,
                      ServiceDescription: item.ServiceDescription,
                      MonetaryValue: item.MonetaryValue,
                    });
                  });
                  this.getView().getModel("generatedFreight").setData(data);
                }
              } else {
                if (oResponse.BLUJAYOutput.results.length > 0) {
                  oResponse.BLUJAYOutput.results.forEach(function (item) {
                    data.push({
                      ServiceCode: item.Carrier,
                      ServiceDescription: item.Carrier,
                      MonetaryValue: item.TotalFreight,
                    });
                  });
                  this.getView().getModel("generatedFreight").setData(data);
                }
              }
              this.byId("idTableFreightShipping").setSelectedIndex(0);
              this._setAppBusy(false);
            }.bind(this)
          )
          .fail(
            function (oError) {
              sap.m.MessageBox.error(
                JSON.parse(oError.responseText).error.message.value
              );
              this._setAppBusy(false);
            }.bind(this)
          );
      },
      
      onSelectShippingType: function (oEvent) {
        var total = this.getView().getModel("TotalValues");
        var data = total.getData();
        var sPath = oEvent.getParameter("rowContext").sPath;
        if (sPath.charAt(1) === "0") {
          data.totalShipping = "0.00";
          this.getView().byId("idFreightShippingCharge").setEnabled(true);
        } else {
          this.getView().byId("idFreightShippingCharge").setEnabled(false);

          data.totalShipping = oEvent
            .getParameter("rowContext")
            .getModel()
            .getObject(sPath).MonetaryValue;
        }
        this.getView()
          .byId("idFreightShippingCharge")
          .setValue(data.totalShipping);
        data.totalTax = "0.00";
        data.totalProfit = "0.00";
        total.setData(data);
        this.updateTotalValues();
      },
      updateTotalValues: function () {
        var aData = this.getView().getModel("QuotedetailModel").getData();
        var total = this.getView().getModel("TotalValues");
        var data = total.getData();
        aData.QUOTEITEMS.results.forEach(function (item) {
          data.totalTax = (
            parseFloat(data.totalTax) + parseFloat(item.Mwsbp)
          ).toFixed(2);
          data.totalProfit = (
            parseFloat(data.totalProfit) + parseFloat(item.Profit)
          ).toFixed(2);
        });
        data.total = (
          parseFloat(aData.QUOTEHEADER.Netwr) +
          parseFloat(data.totalShipping) +
          parseFloat(data.totalTax)
        ).toFixed(2);
        total.setData(data);
      },
      onChangeShippingCharge: function () {
        var total = this.getView().getModel("TotalValues");
        var data = total.getData();
        data.totalShipping = this.getView()
          .byId("idFreightShippingCharge")
          .getValue();
        total.setData(data);
        this.updateTotalValues();
      },
      generateEQuoteLink: function () {
        var isDataChanged = sap.ushell.Container.getDirtyFlag();
        if (isDataChanged) {
          alert("please save first");
        }
      },

      onPressEditQuoteDetail: function () {
        this.getQuoteDetails(this.vbeln);
        if (
          this.getView().getModel("this").getProperty("/CurrViewMode") ===
          "EDIT"
        ) {
          this.getView()
            .getModel("this")
            .setProperty("/CurrViewMode", "DISPLAY");
        }
        if (
          this.getView().getModel("this").getProperty("/CurrViewMode") ===
          "DISPLAY"
        ) {
          this.getView().getModel("this").setProperty("/CurrViewMode", "EDIT");
          this.getView()
            .getModel("this")
            .setProperty("/CurrButtonViewMode", "CREATE_ORDER");
        }
      },
      generateEQuoteLink: function () {
        this._setAppBusy(true);
        var aData = this.getView().getModel("QuotedetailModel").getData();
        BO.generateEQuoteLink(this.getView(), aData)
          .then(
            function () {
              this._setAppBusy(false);
            }.bind(this)
          )
          .fail(
            function (oError) {
              this._handleError(oError);
            }.bind(this)
          );
      },
      emailQuote: function () {
        var aData = this.getView().getModel("QuotedetailModel").getData();
        if (aData.QUOTEHEADER.QtEmail) {
          this._setAppBusy(true);
          this.getView().byId("idQuickHeaderEmail").setValueState("None");
          BO.emailEQuoteLink(this.getView(), aData)
            .then(
              function () {
                this._setAppBusy(false);
              }.bind(this)
            )
            .fail(
              function (oError) {
                this._handleError(oError);
              }.bind(this)
            );
        } else {
          this.getView().byId("idQuickHeaderEmail").setValueState("Error");
        }
      },
      _handleError: function (oError) {
        this._setAppBusy(false);
        sap.m.MessageBox.error(
          JSON.parse(oError.responseText).error.message.value
        );
      },

      _setAppBusy: function (flag) {
        if (flag) {
          BusyIndicator.show();
        } else {
          BusyIndicator.hide();
        }
      },
    });
  }
);
