;// Copyright Bitwise Labs. All rights reserved.

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'Express',
    elements: [{
        name: "John Smith",
        persons: 4,
        number: "123"
    }, {
        name: "John Smith",
        persons: 4,
        number: "456"
    }]});
};
