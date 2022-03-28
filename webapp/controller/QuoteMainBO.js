sap.ui.define([
	
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
    "sap/m/Token"
], function( JSONModel, Filter, FilterOperator, Fragment, Token) {
	"use strict";
	return {
    
        onInputVH:function(oControl, ColModel, oDataModel, sFragment, globalThis , sEntity){
            var aCols = ColModel.getData().cols;

        Fragment.load({
            name: sFragment,
            controller: globalThis
        }).then(function name(oFragment) {
            globalThis._oValueHelpDialog = oFragment;
            globalThis.getView().addDependent(globalThis._oValueHelpDialog);

            globalThis._oValueHelpDialog.getTableAsync().then(function (oTable) {
                oTable.setModel(oDataModel);
                oTable.setModel(ColModel, "columns");

                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", sEntity );
                }

                if (oTable.bindItems) {
                    oTable.bindAggregation("items", sEntity, function () {
                        return new ColumnListItem({
                            cells: aCols.map(function (column) {
                                return new Label({ text: "{" + column.template + "}" });
                            })
                        });
                    });
                }

                globalThis._oValueHelpDialog.update();
            }.bind(globalThis));

            var oToken = new Token();
            oToken.setKey(oControl.getSelectedKey());
            oToken.setText(oControl.getValue());
            globalThis._oValueHelpDialog.setTokens([oToken]);
            globalThis._oValueHelpDialog.open();
        }.bind(globalThis));

    },

    onValueHelpOkPress: function (aTokens, oControl, globalThis) {
        if (aTokens.length > 0) {
            oControl.setValue(aTokens[0].getText());
        }
        globalThis._oValueHelpDialog.close();
    },

    onValueHelpCancelPress: function (globalThis) {
        globalThis._oValueHelpDialog.close();
    },

    onValueHelpAfterClose: function (globalThis) {
        globalThis._oValueHelpDialog.destroy();
    }
    
    }
});