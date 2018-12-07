const express = require('express');
const router = express.Router();
const Auth = require('../middlewares/auth');
const OrdersController = require('../controllers/orders');

router.get('/', Auth, OrdersController.getAllOrders);
router.post('/', Auth, OrdersController.postOrder);
// The string ("orderID") should match req.params.orderID
router.get("/:orderID", Auth, OrdersController.getOrderDetails);
router.delete("/:orderID", Auth, OrdersController.deleteOrder);

module.exports = router;