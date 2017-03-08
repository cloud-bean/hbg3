var path = require('path');
var inventoryCtrl = require('../controllers/inventory.server.controller');
var authHelper = require(path.resolve('./config/helper/auth'));
var express = require('express');
var router = express.Router();

router.get('/inventories', authHelper.isAuthAllowed, inventoryCtrl.list);
router.get('/inventories/:inventoryId', authHelper.isAuthAllowed, inventoryCtrl.read);
router.param('inventoryId', inventoryCtrl.inventoryByID);

module.exports = router;
