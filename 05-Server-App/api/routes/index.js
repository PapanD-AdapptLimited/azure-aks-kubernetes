var express = require('express');
var router = express.Router();
var os = require('os');

router.use('/health', (req, res)=>{
  res.status(200).end();
})
router.use('/ping', (req, res)=>{
  res.status(200).json({
    status:true, message:"pong"
  });
})
router.use('/hostname', (req,res)=>{
  res.status(200).json({
    status:true,
    hostname: os.hostname()
  })
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('Customers', { title: 'This is Customers API service page.' });
});

module.exports = router;
