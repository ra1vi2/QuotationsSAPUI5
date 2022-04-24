 sap.ui.define([
	"sap/base/util/merge"
], function(merge) {
	"use strict";
	return {
		odataRead: function(oModel, sPath, mParameters) {
			var oReadDeferred = jQuery.Deferred(),
				mRequestProps = jQuery.extend(true, {
					success: oReadDeferred.resolve,
					error: oReadDeferred.reject
				}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sPath) ? "" : "/";
			oModel.read(sPathPrefix + sPath, mRequestProps);

			return oReadDeferred.promise();
		},
		odataCreate: function(oModel, sEntitySet, oEntityData, mParameters) {
			var oCreateDeferred = jQuery.Deferred(),
				mRequestProps = jQuery.extend(true, {
					success: function(oData, oResponse) {
						oCreateDeferred.resolve(oData, oResponse);
					},
					error: oCreateDeferred.reject
				}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sEntitySet) ? "" : "/";
			oModel.create(sPathPrefix + sEntitySet, oEntityData,
				mRequestProps);

			return oCreateDeferred.promise();
		},
		odataUpdate: function(oODataModel, sEntitySet, oUpdatedData, mParameters) {
			var oUpdateDeferred = jQuery.Deferred();
			var mRequestProps = jQuery.extend(true, {
				success: oUpdateDeferred.resolve,
				error: oUpdateDeferred.reject
			}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sEntitySet) ? "" : "/";
			oODataModel.update(sPathPrefix + sEntitySet, oUpdatedData, mRequestProps);

			return oUpdateDeferred.promise();
		},
        	odataCallFunction: function(oModel, sPath, mParameters) {
			var oCallFunctionDeferred = jQuery.Deferred(),
			mRequestProps = jQuery.extend(true, {
				success: oCallFunctionDeferred.resolve,
				error: oCallFunctionDeferred.reject
			}, mParameters);

			var sPathPrefix = /^\/.*$/.test(sPath) ? "" : "/";
			oModel.callFunction(sPathPrefix + sPath, mRequestProps);

			return oCallFunctionDeferred.promise();
		},
		
	};
});
