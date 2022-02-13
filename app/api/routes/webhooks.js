const express = require('express');
const router = express.Router();
 const axios = require('axios');
const colors = require('colors')
const async = require('async');

router.post("/saver-webhook", async function(req, res){
  const data = req.body;
  console.log("Hook",data);

  res.json("{}")
});

module.exports = router 


