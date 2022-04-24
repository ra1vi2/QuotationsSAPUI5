sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "./QuoteDetailBO",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
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
    syncStyleClass
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
        var oDetailData = {
          QUOTEHEADER: {},
        };
        var oGoModel = this.getOwnerComponent().getModel("onGoResponseModel");
        if (oGoModel) {
          var oGoModelData = oGoModel.getData();
          oDetailData.QUOTEHEADER.Angdt = oGoModelData.ValidFrom;
          oDetailData.QUOTEHEADER.Bnddt = oGoModelData.ValidTo;
        } else {
          this.onNavBack();
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
      },
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          history.go(-1);
        } else {
          this.getRouter().navTo("RouteQuoteMain", {}, true);
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
      onChangeSoldTo: function () {
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
            //that.getView().setModel(new JSONModel(oResponse.MASTERFIELDSNAV), "masterdatamodel");
            that.openShipToPopUp();
            //that.setMasterDataFields();
          })
          .fail(function (oError) {
            sap.m.MessageBox.error(
              JSON.parse(oError.responseText).error.message.value
            );
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
        BO.getShipToAddress(this.getView().getModel(), {
          vbeln: "",
          kunag: soldTo,
          kunwe: shipTo,
          auart: auart,
          vkorg: Vkorg,
          vtweg: Vtweg,
          spart: Spart,
        })
          .then(function (oResponse) {
            /* that.getView().byId("idShipToAddress")
                         .setText(
                             oResponse.SOLDTOADDRESSNAV.Name +
                             oResponse.SOLDTOADDRESSNAV.Street +
                             oResponse.SOLDTOADDRESSNAV.City);
                 }); */
            if (oResponse.QUOTEITEMS.results.length === 0) {
              oResponse.QUOTEITEMS.results.push({
                Posnr: "10",
                ItemZzmatSrc: oResponse.QUOTEHEADER.HeaderZzmatSrc,
              });
            }
            that.getView().getModel("QuotedetailModel").setData(oResponse);
          })
          .fail(function (oError) {
            sap.m.MessageBox.error(
              JSON.parse(oError.responseText).error.message.value
            );
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
        BO.readItemTableLine(oView, oSelectedObject).then(
          function () {
            this.handleLineItemUpdate.apply(this, arguments);
          }.bind(this)
        );
      },
      onSubmitQuote: function () {
        BO.submitQuote(this.getView())
          .then(function () {
            alert("success");
          })
          .fail(function () {
            alert("Error");
          });
      },
    });
  }
);
