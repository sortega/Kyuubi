;// Copyright Bitwise Labs. All rights reserved.

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
