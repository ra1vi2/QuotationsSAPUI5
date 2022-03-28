/*global QUnit*/

sap.ui.define([
	"comquote/quotations/controller/QuoteMain.controller"
], function (Controller) {
	"use strict";

	QUnit.module("QuoteMain Controller");

	QUnit.test("I should test the QuoteMain controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
