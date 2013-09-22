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

        var queueId = $(".queue")[0].getAttribute("queue-id");
        var queueResource = "/api/queue/" + queueId;

        function setNextElement(node) {
            node.addClass("q-head");
            var actions = $('<div class="card-actions"/>');
            var presentButton = $('<button type="button">Presente</button>');
            presentButton.click(makeDequeueHandler());
            actions.append(presentButton);
            var missingButton = $('<button type="button">Ausente</button>');
            missingButton.click(makeDequeueHandler("missing"));
            actions.append(missingButton);
            node.append(actions);
        }

        function makeDequeueHandler(notification) {
            return function(ev) {
                var request = { action: "pop" }
                if (notification) {
                    request.notification = notification;
                }
                $.post(queueResource, request)
                    .then(updateQueue, function(jxXHR, textStatus, error) {
                        alert("No se pudo contactar con el servidor.");
                    });
            };
        };

        function toPhoneNumber(text) {
            var digits = text.replace(/\\s/g, "");
            if (digits.search("^\\d{9}$") >= 0) {
                return digits;
            }
        }

        function updateQueue(queue) {
            var area = $('#queue-area');
            area.empty();
            
            if (queue.members.length === 0) {
                area.text("Cola vacía");    
            }

            queue.members.forEach(function(member, index) {
                var card = $('<div class="card"/>');
                card.append($('<div class="id">' + member.id + '</div>'));
                card.append($('<div class="number">' + member.phoneNumber + 
                    '</div>'));
                var element = $('<div class="q-elem"/>');
                if (index === 0) {
                    setNextElement(element);
                }
                element.append(card);
                area.append(element);
            });
        };

        function setMessage(text) {
            $('#message').text(text);
            $('#message').show();
        }

        function queueNewMember(queue) {
            var newMember = queue.members.slice(-1)[0];
            setMessage(newMember.phoneNumber + ' añadido con número ' + newMember.id);
            $('#enqueue form')[0].reset();
            validateEnqueueForm();
            updateQueue(queue);
        };

        $('#enqueue form').submit(function(e) {
            e.preventDefault();
            var phoneNumber = toPhoneNumber($('#phoneNumber').val());
            var request = { 
                action: "push",
                member: {
                    phoneNumber: phoneNumber
                }
            };
            $.post(queueResource, request, null, "json").then(queueNewMember, function() {
                alert("No se pudo añadir a la cola");
            });
        });

        function validateEnqueueForm() {
            var submitButton = $("#enqueue-submit");
            if (toPhoneNumber($("input#phoneNumber").val())) {
                submitButton.removeAttr("disabled");
            } else {
                submitButton.attr("disabled", true);
            }
        };

        $("#phoneNumber").on("input", validateEnqueueForm)

        $('#clear-queue').click(function() {
            if (confirm("¿Está seguro de que desea limpiar la cola?")) {
                $.post(queueResource, { action: "clear" })
                    .then(function (queue) { updateQueue(queue); }, 
                        function (error) { updateQueue({ members: [] })});
            }
        });

        $.get(queueResource).then(function(queue, textStatus, jqXHR) {             
            updateQueue(queue);
        }, function(jxXHR, textStatus, error) {
            alert("No se pudo contactar con el servidor.");
        });
    });
});
