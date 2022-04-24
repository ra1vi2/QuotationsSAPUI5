sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";
  return {
    createColumn: function (sRequestedVH) {
      if (sRequestedVH === "SalesOrg")
        return new JSONModel({
          cols: [
            {
              label: "Sales Org",
              template: "vkorg",
            },
            {
              label: "Sales Org Description",
              template: "vtext",
            },
          ],
        });

      if (sRequestedVH === "DC") {
        return new JSONModel({
          cols: [
            {
              label: "Distribution Channel",
              template: "Vtweg",
            },
            {
              label: "Distribution Channel Description",
              template: "Vtext",
            },
          ],
        });
      }

      if (sRequestedVH === "Division") {
        return new JSONModel({
          cols: [
            {
              label: "Division",
              template: "Spart",
            },
            {
              label: "Diviosn Description",
              template: "Vtext",
            },
          ],
        });
      }
      if (sRequestedVH === "QuoteNumber") {
        return new JSONModel({
          cols: [
            {
              label: "PO Number",
              template: "Bstkd",
            },
            {
              label: "S.Org",
              template: "Vkorg",
            },
            {
              label: "Sold To",
              template: "Kunnr",
            },
            {
              label: "D.Chl",
              template: "Vtweg",
            },
            {
              label: "DV",
              template: "Spart",
            },
            {
              label: "S.Off",
              template: "Vkbur",
            },
            {
              label: "S.Grp",
              template: "Vkgrp",
            },
            {
              label: "Created By",
              template: "Ernam",
            },
            {
              label: "S.Type",
              template: "Auart",
            },
            {
              label: "CustRefDate",
              template: "Bstdk",
            },
            {
              label: "TrG",
              template: "Trvog",
            },
            {
              label: "Document",
              template: "Vbeln",
            },
            {
              label: "Item",
              template: "Posnr",
            },
          ],
        });
      }
      if (sRequestedVH === "SoldTo" || sRequestedVH === "ShipTo") {
        return new JSONModel({
          cols: [
            {
              label: "Sales Org",
              template: "Vkorg",
            },
            {
              label: "Search Term",
              template: "Sortl",
            },
            {
              label: "Country",
              template: "Land1",
            },
            {
              label: "Postal Code",
              template: "Pstlz",
            },
            {
              label: "Search Term",
              template: "Sortl",
            },
            {
              label: "City",
              template: "Mcod3",
            },
            {
              label: "Name",
              template: "Mcod1",
            },
            {
              label: "Customer",
              template: "Kunnr",
            },
            {
              label: "Distribution Channel",
              template: "Vtweg",
            },
            {
              label: "Division",
              template: "Spart",
            },
            {
              label: "Sales Office",
              template: "Vkbur",
            },
            {
              label: "Sales Group",
              template: "Vkgrp",
            },
          ],
        });
      }
      if (sRequestedVH === "Plant") {
        return new JSONModel({
          cols: [
            {
              label: "Plant",
              template: "Werks",
            },
            {
              label: "Description",
              template: "Name1",
            },
          ],
        });
      }
      if (sRequestedVH === "MaterialSource") {
        return new JSONModel({
          cols: [
            {
              label: "Material Source",
              template: "Key",
            },
            {
              label: "Description",
              template: "Value",
            },
          ],
        });
      }
      if (sRequestedVH === "IncoTerms1") {
        return new JSONModel({
          cols: [
            {
              label: "Inco Terms",
              template: "Inco1",
            },
            {
              label: "Description",
              template: "Bezei",
            },
          ],
        });
      }
      if (sRequestedVH === "MaterialNumber") {
        return new JSONModel({
          cols: [
            {
              label: "Material",
              template: "Matnr",
            },
            {
              label: "Description",
              template: "Maktg",
            },
          ],
        });
      }
    },
  };
});
