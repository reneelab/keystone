/**
 * Configures Let's Encrypt if enabled.
 *
 * consumed by server/createApp.js
 *
 * @api private
 */

'use strict';

var Greenlock = require('greenlock-express');

module.exports = function (keystone, app){


	var options = keystone.get('greenlock');
	var ssl = keystone.get('ssl');
	if (!options) {
		return;
	}
	if (!ssl) {
		console.error('Ignoring `letsencrypt` setting because `ssl` is not set.');
	}
	if (ssl === 'only') {
		console.error('To use Let\'s Encrypt you need to have a regular HTTP listener as well. Please set ssl to either `true` or `"force"`.');
	}

	var email = options.email;
	var approveDomains = options.domains;
	var server = (options.production === 'production' ? 'https://acme-v02.api.letsencrypt.org/directory' : 'https://acme-staging-v02.api.letsencrypt.org/directory');
	var agreeTos = options.tos;
	var renewWithin = options.renewWithin;
	var renewBy = options.renewBy;
	
	if (!Array.isArray(approveDomains)) {
		approveDomains = [approveDomains];
	}
	if (!(agreeTos && email && approveDomains)) {
		console.error("For auto registation with Let's Encrypt you have to agree to the TOS (https://letsencrypt.org/repository/) (tos: true), provide domains (domains: ['mydomain.com', 'www.mydomain.com']) and a domain owner email (email: 'admin@mydomain.com')");
		return;
	}

	var greenlock = Greenlock.create({

	  // Let's Encrypt v2 is ACME draft 11
	  version: 'draft-11'

	, server: server
	  // Note: If at first you don't succeed, stop and switch to staging
	  // https://acme-staging-v02.api.letsencrypt.org/directory

	  // You MUST change this to a valid email address
	, email: email

	  // You MUST NOT build clients that accept the ToS without asking the user
	, agreeTos: agreeTos

	  // You MUST change these to valid domains
	  // NOTE: all domains will validated and listed on the certificate
	, approvedDomains: approveDomains

	  // You MUST have access to write to directory where certs are saved
	  // ex: /home/foouser/acme/etc
	, configDir: '~/.config/acme/'

	  // Get notified of important updates and help me make greenlock better
	, communityMember: true

	//, debug: true
	, renewWithin: renewWithin
	, renewBy: renewBy

	});

	keystone.set('https server options', greenlock.httpsOptions);
	app.use(greenlock.middleware());

}
