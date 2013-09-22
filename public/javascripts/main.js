;// Copyright Bitwise Labs. All rights reserved.

"use strict";

require(['jquery', 'jquery_pjax', 'jquery_cookie'], function($) {
    $(document).ready(function() {
        $('#login').submit(function(e) {
            var errorDiv = $('#error');
            var username = $('#username').val();
            var password = $('#password').val();
            errorDiv.empty();
            $.post('/api/login', {
                username: username,
                password: password
            }).then(function(data, textStatus, jqXHR){
                window.location.href = '/queue';
            }, function(data) {
                errorDiv.append("Error: " + data.responseJSON.errorDescription);
            });
            e.preventDefault();
        });
    });
});
