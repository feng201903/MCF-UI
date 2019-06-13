var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var ALPHABET_MAP = {};
var BASE = 58;

for (var i = 0; i < ALPHABET.length; i++) {
	ALPHABET_MAP[ALPHABET.charAt(i)] = i;
}

/**API**/
function ToUTF8(str) {
	var result = new Array();

	var k = 0;
	for (var i = 0; i < str.length; i++) {
		var j = encodeURI(str[i]);
		if (j.length == 1) {
			// 未转换的字符
			result[k++] = j.charCodeAt(0);
		} else {
			// 转换成%XX形式的字符
			var bytes = j.split("%");
			for (var l = 1; l < bytes.length; l++) {
				result[k++] = parseInt("0x" + bytes[l]);
			}
		}
	}

	return result;
}

// 如果有特殊需求，要转成utf16，可以用以下函数
function ToUTF16(str) {
	var result = new Array();

	var k = 0;
	for (var i = 0; i < str.length; i++) {
		var j = str[i].charCodeAt(0);
		result[k++] = j & 0xFF;
		result[k++] = j >> 8;
	}

	return result;
}

//传进已经转成字节的数组 -->buffer(utf8格式) 
function encode(buffer) {
	if (buffer.length === 0) return '';
	var i,
		j,
		digits = [0];
	for (i = 0; i < buffer.length; i++) {
		for (j = 0; j < digits.length; j++) {
			// 将数据转为二进制，再位运算右边添8个0，得到的数转二进制
			// 位运算-->相当于 digits[j].toString(2);parseInt(10011100000000,2)
			digits[j] <<= 8;
		}
		digits[0] += buffer[i];
		var carry = 0;
		for (j = 0; j < digits.length; ++j) {
			digits[j] += carry;
			carry = (digits[j] / BASE) | 0;
			digits[j] %= BASE;
		}
		while (carry) {
			digits.push(carry % BASE);
			carry = (carry / BASE) | 0;
		}
	}
	// deal with leading zeros
	for (i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) digits.push(0);
	return digits
		.reverse()
		.map(function(digit) {
			return ALPHABET[digit];
		})
		.join('');
}

function decode(string) {
	if (string.length === 0) return [];
	var i,
		j,
		bytes = [0];
	for (i = 0; i < string.length; i++) {
		var c = string[i];
		// c是不是ALPHABET_MAP的key 
		if (!(c in ALPHABET_MAP)) throw new Error('Non-base58 character');
		for (j = 0; j < bytes.length; j++) bytes[j] *= BASE;
		bytes[0] += ALPHABET_MAP[c];
		var carry = 0;
		for (j = 0; j < bytes.length; ++j) {
			bytes[j] += carry;
			carry = bytes[j] >> 8;
			// 0xff --> 11111111
			bytes[j] &= 0xff;
		}
		while (carry) {
			bytes.push(carry & 0xff);
			carry >>= 8;
		}
	}
	// deal with leading zeros
	for (i = 0; string[i] === '1' && i < string.length - 1; i++) bytes.push(0);
	return bytes.reverse();
}

// 传字节数组
function byteToString(arr) {
	if (typeof arr === 'string') {
		return arr;
	}
	var str = '',
		_arr = arr;
	for (var i = 0; i < _arr.length; i++) {
		// 数组中每个数字转为二进制 匹配出开头为1的直到0的字符
		// eg:123-->"1111011"-->{0:"1111",groups: undefined, index: 0, input: "1111011"}
		var one = _arr[i].toString(2),
			v = one.match(/^1+?(?=0)/);
		if (v && one.length == 8) {
			var bytesLength = v[0].length;
			var store = _arr[i].toString(2).slice(7 - bytesLength);
			for (var st = 1; st < bytesLength; st++) {
				store += _arr[st + i].toString(2).slice(2);
			}
			str += String.fromCharCode(parseInt(store, 2));
			i += bytesLength - 1;
		} else {
			str += String.fromCharCode(_arr[i]);
		}
	}
	return str;
}

function hexStringToArray(str) {
	var arrayLen = str.length / 2;
	var array = [];
	for (var i = 0; i < arrayLen; i++) {
		var valueStr = str.substring(0, 2);
		var value = parseInt(valueStr, 16);
		array.push(value);
		str = str.slice(2);
	}
	return array;
}

function strToHexCharCode(str) {
	if (str === "")
		return "";
	var hexCharCode = [];
	for (var i = 0; i < str.length; i++) {
		hexCharCode.push((str.charCodeAt(i)).toString(16));
	}
	return hexCharCode.join("");
}

function strAddZero(str, length) {
	var len = str.length;
	//console.log('len:'+len)
	for (var i = 0; i < length - len; i++) {
		str = '0' + str;
	}
	return str;

}

function appendBuffer(buffer1, buffer2) {
	buffer1 = new Uint8Array(buffer1);
	buffer2 = new Uint8Array(buffer2);
	var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	tmp.set(buffer1, 0);
	tmp.set(buffer2, buffer1.byteLength);
	return tmp;
}


function Uint8ArrayToString(fileData) {
	var dataString = "";
	for (var i = 0; i < fileData.length; i++) {
		dataString += String.fromCharCode(fileData[i]);
	}
	return dataString
}


function Decodeuint8arr(uint8array) {
	return new TextDecoder("utf-8").decode(uint8array);
}

function Utf8ArrayToStr(array) {
	var out, i, len, c;
	var char2, char3;

	out = "";
	len = array.length;
	i = 0;
	while (i < len) {
		c = array[i++];
		switch (c >> 4) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
				// 0xxxxxxx
				out += String.fromCharCode(c);
				break;
			case 12:
			case 13:
				// 110x xxxx   10xx xxxx
				char2 = array[i++];
				out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
				break;
			case 14:
				// 1110 xxxx  10xx xxxx  10xx xxxx
				char2 = array[i++];
				char3 = array[i++];
				out += String.fromCharCode(((c & 0x0F) << 12) |
					((char2 & 0x3F) << 6) |
					((char3 & 0x3F) << 0));
				break;
		}
	}

	return out;
}

function cryptoEncrypt(plaintText, key) {
	key = hardenKey(key, 10000)
	var text = CryptoJS.AES.encrypt(plaintText, key).toString();
	return text;
}

function cryptoDecrypt(ciphertext, key) {
	key = hardenKey(key, 10000)
	return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
}

function hashRounds(s, n) {
	var os = s;
	for (var i = 0; i < n; i++)
		s = SHA256.hash(s + os);

	return s;
}

function hardenKey(key, rounds) {
	var salt = readStorage("salt").salt;
	// console.log(salt);
	return hashRounds(key + salt, rounds);
}

function getAccountAddressFromPublicKey(publicKey) {
	var ADDRESS_VERSION = 58; // Q

	if (typeof(publicKey) == "string") {
		publicKey = decode(publicKey);
	}

	var publicKeyHashSHA256 = SHA256.digest(publicKey);
	var publicKeyHashHex = uint8ToHex(publicKeyHashSHA256);
	var publicKeyHashWordArray = CryptoJS.enc.Hex.parse(publicKeyHashHex);
	CryptoJS.RIPEMD160(publicKeyHashSHA256).toString();
	var publicKeyHash = CryptoJS.RIPEMD160(publicKeyHashWordArray).toString();
	var addressArray = new Uint8Array();
	addressArray = appendBuffer(addressArray, [ADDRESS_VERSION]);
	addressArray = appendBuffer(addressArray, hexToUint8(publicKeyHash));
	var checkSum = SHA256.digest(SHA256.digest(addressArray));
	addressArray = appendBuffer(addressArray, checkSum.subarray(0, 4));
	return encode(addressArray);
}

// function hexToUint8(hexString) {
// 	return new Uint8Array(hexString.match(/.{1,2}/g).map(byte =>
// 		parseInt(byte, 16)));
// }

function hexToUint8(hexString) {
	return new Uint8Array(hexString.match(/.{1,2}/g).map(function(byte) {
		return parseInt(byte, 16);
	}));
}

// function uint8ToHex(ary) {
// 	return Array.prototype.map.call(ary, x => ('00' +
// 		x.toString(16)).slice(-2)).join('');
// }
// 
function uint8ToHex(ary) {
	return Array.prototype.map.call(ary, function(x) {
		return ('00' + x.toString(16)).slice(-2);
	}).join('');
}

function appendBuffer(buffer1, buffer2) {
	buffer1 = new Uint8Array(buffer1);
	buffer2 = new Uint8Array(buffer2);
	var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
	tmp.set(buffer1, 0);
	tmp.set(buffer2, buffer1.byteLength);
	return tmp;
}
