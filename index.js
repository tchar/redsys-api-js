const crypto = require('crypto');


var RedsysAPI = function(){
	this.params = new Map();
}

RedsysAPI.prototype.setParameter = function(key, val){
	this.params.set(key, val);
}

RedsysAPI.prototype.getParameter = function(key){
	return this.params.get(key);
}

RedsysAPI.prototype.createMerchantParameters = function(){
	var paramsJSON = {};
	this.params.forEach(function(value, key){
		paramsJSON[key] = value;
	})
	return Buffer.from(JSON.stringify(paramsJSON)).toString('base64');
}

RedsysAPI.prototype.createMerchantSignature = function(key){

	var thisObj = this;

	function getOrderId(){
		var ret;
		thisObj.params.forEach(function(item, key){
			if (key.toUpperCase() === 'DS_MERCHANT_ORDER'){
				ret = item;
				return -1;
			}
		})
		return ret;
	}


	var iv = Buffer.alloc(8, 0, 'utf8');
	var cipher = crypto.createCipheriv('des-ede3-cbc', Buffer.from(key, 'base64'), iv);
	cipher.setAutoPadding(false);
	var orderId = Buffer.from(getOrderId());
	var pad = Buffer.alloc((Math.ceil(orderId.length / 8) * 8) - orderId.length, 0);

	key = Buffer.concat([cipher.update(orderId), cipher.update(pad), cipher.final()]);

    var hash = crypto.createHmac('sha256', key);
	hash.update(Buffer.from(this.createMerchantParameters()));
	return hash.digest('base64');
}

RedsysAPI.prototype.createMerchantSignatureNotif = function(key, params){
	var paramsJSON = JSON.parse(Buffer.from(params, "base64").toString());
	
	var iv = Buffer.alloc(8, 0, 'utf8');
	var cipher = crypto.createCipheriv('des-ede3-cbc', Buffer.from(key, 'base64'), iv);
	cipher.setAutoPadding(false);
	var orderId = Buffer.from(paramsJSON['Ds_Order']);
	var pad = Buffer.alloc((Math.ceil(orderId.length / 8) * 8) - orderId.length, 0);
	key = Buffer.concat([cipher.update(orderId), cipher.update(pad), cipher.final()]);
    var hash = crypto.createHmac('sha256', key);
	hash.update(params);
	var digest = hash.digest('base64');
	return digest;

}

RedsysAPI.prototype.checkMerchantSignatureNotif = function(key, params, signature){
	var paramsJSON = JSON.parse(Buffer.from(params, "base64").toString());
	var signatureNotif = this.createMerchantSignatureNotif(key, params);
	return Buffer.from(signatureNotif, 'base64').equals(Buffer.from(signature, 'base64'));
}

RedsysAPI.prototype.decodeMerchantParameters = function(params){
	var paramsJSON = JSON.parse(Buffer.from(params, 'base64').toString());
	for (key in paramsJSON){
		this.setParameter(key, paramsJSON[key]);
	}
	return paramsJSON;
}

module.exports = RedsysAPI;