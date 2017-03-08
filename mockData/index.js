/**
 * Copyright 2015 Erealm Info & Tech.
 *
 * Created by ken on 11/16/15
 */

'use strict';
var config = require('../config/config');
var mongoose = require('mongoose');
var fs = require("fs");
var contents = fs.readFileSync("mockData/mockData.json");
var data = JSON.parse(contents);
var async = require('async');

exports.requests = data.requests;

exports.data = {};

function getRandomInt(min, max) {
	if (!max) {
		max = min;
		min = 0;
	}
	return Math.floor(Math.random() * (max - min)) + min;
}

var cleanAllData = function (cb) {
	var collections = mongoose.connection.collections;
	console.log('Host: ' + mongoose.connection.host);
	console.log('DB Name: ' + mongoose.connection.name);
	var len = Object.keys(collections).length, count = 0;
	if (len === 0) {
		console.log('collections empty');
		console.log('Delete DB Finished');
		return cb();
	} else {
		for (var i in mongoose.connection.collections) {
			console.log('Delete: ' + mongoose.connection.collections[i].name);
			mongoose.connection.collections[i].remove(function () {
				count++;
				if (count === len) {
					console.log('Delete DB Finished');
					return cb();
				}
			});
		}
	}
};

var createSuperUsers = function (cb) {
	var User = mongoose.model('user');

	async.each(exports.requests.users.super, function (item, callback) {
		var user = new User(item);
		user.status = 1;
		user.save(item, function (err, result) {
			if (err) {
				config.log('err in creating super user:', err.message);
				callback(err);
			} else {
				config.log('New User: ' + result.firstName);
				callback(null);
			}
		});
	}, function (err, result) {
		User.loadAll({criteria: {group: ['superuser']}}, function (err, superUsers) {
			exports.data.superUsers = superUsers;
			config.log('New super user finished ');
			cb(null, superUsers);
		});
	});
};

var createAdminUsers = function (cb) {
	var User = mongoose.model('user');
	async.each(exports.requests.users.admin, function (item, callback) {
		var user = new User(item);
		user.status = 1;
		user.save(function (err, result) {
			if (err) {
				config.log('err in creating super user:', err.message);
				callback(err);
			} else {
				config.log('New User: ' + result.firstName);
				callback(null);
			}
		});
	}, function (err, result) {
		User.loadAll({criteria: {roles: ['admin']}}, function (err, adminUsers) {
			exports.data.adminUsers = adminUsers;
			config.log('New Admin user finished ');
			cb(null, adminUsers);
		});
	});
};

var createUsers = function (cb) {
	var User = mongoose.model('user');
	async.each(exports.requests.users.user, function (item, callback) {
		var user = new User(item);
		user.status = 1;
		user.save(function (err, result) {
			if (err) {
				config.log('err in creating super user:', err.message);
				callback(err);
			} else {
				config.log('New User: ' + result.firstName);
				callback(null);
			}
		});
	}, function (err, result) {
		User.loadAll({criteria: {roles: ['user']}}, function (err, user) {
			exports.data.user = user;
			config.log('New users finished ');
			cb(null, user);
		});
	});
}

var createEmailTemplates = function (cb) {
	var emailTemplateList = data.requests.emailTemplates;
	var EmailTemplate = mongoose.model('emailTemplate');

	async.map(emailTemplateList, function (emailTemplateData, callback) {
		var emailTemplate = new EmailTemplate(emailTemplateData);
		emailTemplate.save(function (err, newEmailTemplate) {
			if (err || !newEmailTemplate) {
				callback(err || 'no new email template created');
			} else {
				callback(null, newEmailTemplate);
			}
		});
	}, function (err, results) {
		cb && cb(err, results);
	});
};

var createClients = function (cb) {
	var clients = data.requests.clients;
	var Client = mongoose.model('client');

	async.each(clients, function (item, callback) {
		var client = new Client(item);
		client.save(function (err, result) {
			config.log('New client: ' + client.clientName);
			callback();
		});
	}, function (err, result) {
		Client.find({}, function (err, clients) {
			config.log('New client finished ');
			cb(null, clients);
		});
	});

};

var setupMockDataTasks = {
	createBaseDB: [
		cleanAllData,
		createSuperUsers,
		createEmailTemplates,
		createClients
	],
	createDemoDB: [
		cleanAllData,
		createSuperUsers,
		createAdminUsers,
		createEmailTemplates,
		createClients
	],
	createApiBaseDB: [
		cleanAllData,
		createSuperUsers,
		createEmailTemplates,
		createUsers,
		createClients
	]
};

exports.cleanAllData = cleanAllData;

exports.loginSuperuser = function (api, done, callback) {
	async.series(setupMockDataTasks.createBaseDB, function (err, res) {
		var superUser = data.requests.users.super[0];
		api.post('/app/auth/signin')
			.set('Content-Type', 'application/json')
			.send({
				email: superUser.email,
				password: 'default'
			})
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				if (callback) {
					callback();
				} else {
					done();
				}
			});
	});
};

exports.loginAdminuser = function (api, done, callback) {
	async.series(setupMockDataTasks.createDemoDB, function (err, res) {
		var adminUser = data.requests.users.admin[0];
		api.post('/app/auth/signin')
			.set('Content-Type', 'application/json')
			.send({
				email: adminUser.email,
				password: 'default'
			})
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				if (callback) {
					callback();
				} else {
					return done();
				}
			});
	});
};

exports.loginUser = function (api, done, callback) {
	async.series(setupMockDataTasks.createApiBaseDB, function (err, res) {
		var user = data.requests.users.user[0];
		var loginInfo = {
			client_id: data.requests.clients[0].clientID,
			client_secret: data.requests.clients[0].clientSecret,
			grant_type: "password",
			username: user.email,
			password: user.password
		};
		api.post('/oauth/token')
			.set('Content-Type', 'application/json')
			.send(loginInfo)
			.expect('Content-Type', /json/)
			.expect(200)
			.end(function (err, res) {
				if (err) {
					return done(err);
				}
				if (callback) {
					callback(res.body);
				} else {
					return done();
				}
			});
	});
};

exports.logoutUser = function (api, done, callback) {
	api.get('/app/auth/signout')
		.set('Content-Type', 'application/json')
		.expect(200)
		.end(function (err, res) {
			if (err) {
				return done(err);
			}
			if (callback) {
				callback();
			} else {
				cleanAllData(function () {
					console.log('the test finish!');
					return done();
				});
			}
		});
};
