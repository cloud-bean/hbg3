/**
 * Created by root on 8/13/2015.
 */
'use strict';

var path = require('path');
var config = require(path.resolve('./config/config'));
var paypal = require('paypal-rest-sdk');
var mongoose = require('mongoose');
var Invoice = mongoose.model('invoice');
//var Order = mongoose.model('order');

//var paypal_config = {
//    api: {
//        mode:'sandbox',
//        host : 'api.sandbox.paypal.com',
//        client_id : 'ASarheItxq0jO0MOhtm9fmAUGnnyOy8buXRcgYDQWYpLMQrBBV1csWBNIq2_uZ-HE0FW1VxxfX6Z4Xmu',
//        client_secret : 'EPbu-e7JS5OyKsYHk-u2b9XkSuqnj7316XE-NjzHKJfAqfoVOzm_kjDWXk6j0sl8lT-X-Wlq6mqnUVnZ'
////        mode:'live',
////        host : 'api.paypal.com',
////        client_id : 'AXh4_fKMrGUrm2F8gxYreLjUCzgBf44x5ckPZCUfURgbw4Rb19uIjYgabVP4rP2cocHJ2oD3jxRhFsIa',
////        client_secret : 'EJ4i5n5gdnpKEYh4nbIAPHTGTVhZwmAOQN5on6NX-5d_cZITW20I6aROXG5X9Ck9rFc8BmxSZwdtw9P0'
//    },
//    url: {
//        return_url: 'http://localhost:7000' + '/orderExecute?orderID=',
//        cancel_url: 'http://localhost:7000' + '/?status=cancel&orderID='
//    }
//};

paypal.configure(config.payment);

exports.createPayment = function (options, callback) {
    var paypalPayment = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal'
        },
        redirect_urls: {
            'return_url': options.return_url,
            'cancel_url': options.cancel_url
        },
        transactions: [{
            amount: {
                currency: 'USD',
                total: options.amount
            },
            description: options.description
        }]
    };

    paypal.payment.create(paypalPayment, {}, function (err, resp) {
        if (err) {
            return callback(err);
        }

        if (resp) {
            var link = resp.links;
            for (var i = 0; i < link.length; i++) {
                if (link[i].rel === 'approval_url') {
                    callback(null, {url: link[i].href});
                }
            }
        }
    });
};

exports.executePayment = function (paymentID, payerID, callback) {
    var payer = {payer_id: payerID};
    paypal.payment.execute(paymentID, payer, {}, callback);
};

exports.payouts = function (options, callback) {
    var sender_batch_id = options.receiptInfo.receiptNumber;
    var sender_item_id = '' + Math.random().toString(36).substring(9);

    var payout_json = {
        'sender_batch_header': {
            'sender_batch_id': sender_batch_id,
            'email_subject': 'Payment from EducationAxis'
        },
        'items': [
            {
                'recipient_type': 'EMAIL',
                'amount': {
                    'value': options.receiptInfo.amount,
                    'currency': 'USD'
                },
                'receiver': options.receiverEmail,
                'note': 'payment to ' + options.receiverEmail,
                'sender_item_id': sender_item_id
            }
        ]
    };
    paypal.payout.create(payout_json, function (err, result) {
        if (err) {
            return callback(err);
        } else {
            if (result.batch_header.batch_status === 'PENDING' || result.batch_header.batch_status === 'PROCESSING' || result.batch_header.batch_status === 'SUCCESS') {
                callback(null, result);
            } else {
                return callback('payouts error');
            }
        }
    });
};
