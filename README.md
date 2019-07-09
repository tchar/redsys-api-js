# redsys-api-js

# How to use

## Create payment form
```javascript
const RedsysAPI = require('redsys-api');

var redsys = new RedsysAPI();
// Add some Parameters
redsys.setParameter('DS_MERCHANT_AMOUNT', 945);
redsys.setParameter('DS_MERCHANT_ORDER', '123456789101');
redsys.setParameter('DS_MERCHANT_MERCHANTCODE', '343801064');
redsys.setParameter('DS_MERCHANT_CURRENCY', '978');
redsys.setParameter('DS_MERCHANT_TRANSACTIONTYPE', data['transactionType']);
redsys.setParameter('DS_MERCHANT_TERMINAL', '1');
redsys.setParameter('DS_MERCHANT_MERCHANTURL', 'http://some_url.com');
redsys.setParameter('DS_MERCHANT_URLOK', 'http://some_other_url.com');
redsys.setParameter('DS_MERCHANT_URLKO', 'http://another_url.com');
redsys.setParameter('DS_MERCHANT_CONSUMERLANGUAGE', '002');
redsys.setParameter('DS_MERCHANT_PRODUCTDESCRIPTION', 'Some description');

var key = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';

var params = redsys.createMerchantParameters();
var signature = redsys.createMerchantSignature(key);

return `
		<!DOCTYPE html>
		<html>

		<head>
		    <title>Test</title>
		</head>

		<body>
		    <form action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST" accept-charset="UTF-8">
		        <div>
		        	<input type="text" name="Ds_SignatureVersion" value="HMAC_SHA256_V1" />
		    	</div>
		    	<div>
		        	<input type="text" name="Ds_MerchantParameters" value="${params}" />
		        </div>
		        <div>
		        	<input type="text" name="Ds_Signature" value="${signature}" />
		        </div>
		        <input type="submit" value="Submit" />
		    </form>
		</body>

		</html>`;
```

## Verify signature
```javascript
// let data be the data from the notification request. then
const RedsysAPI = require('redsys-api');

var redsys = new RedsysAPI();
var encoded = data['Ds_MerchantParameters'];
var signature = data['Ds_Signature'];
var key = 'sq7HjrUOBfKmC576ILgskD5srU870gJ7';
if (redsys.checkMerchantSignatureNotif(key, encoded, signature)){
  var decoded = redsys.decodeMerchantParameters(encoded);
  // do something with the decoded data
} else {
  // do something else
}
```
Note that there is also a method `redsys.createMerchantSignatureNotif(key, encoded)` available that returns base64 signature
to compare with the original, however due to some base64 differencies it is recommended to use the 
`redsys.checkMerchantSignatureNotif(key, encoded, signature)` method. However if you want to use it, make sure to convert
the original signature as `Buffer.from(signature, 'base64').toString('base64');
