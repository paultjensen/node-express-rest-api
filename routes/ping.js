var express = require('express');
var router = express.Router();

/* Send pong for a ping. */
router.get('/', function(req, res) {
  res.send('pong');
});

module.exports = router;
