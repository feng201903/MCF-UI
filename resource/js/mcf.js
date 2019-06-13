var storage = window.localStorage;
var API_SERVER = "http://node7.mcfamily.io:9888/";
var FEE = 0.00001;
// (storage.account) ? accountData = JSON.parse(storage.account): accountData = [];
// (storage.user) ? userData = JSON.parse(storage.user): userData = [];
// (storage.tempAccount) ? tempAccountData = JSON.parse(storage.tempAccount): tempAccountData = [];

//写入localStorage
function writeStorage(i, data) {
	storage[i] = JSON.stringify(data);
}
//读取localStorage
function readStorage(i) {
	!storage[i] ? data = [] : data = JSON.parse(storage[i]);
	return data;
}

//备份助记词前检验密码
function checkPwd(pwd, url) {
	var tempAccountData = readStorage('tempAccount');
	if (tempAccountData.pwd == pwd) {
		window.location.href = url;
	} else {
		var btnArray = ['取消', '确定'];
		mui.confirm('您输入的密码错误,是否放弃当前钱包重新创建？如需放弃,请点击确定', '密码错误', btnArray, function(e) {
			if (e.index == 1) {
				jumppage('personal.html');
			} else {

			}
		})
	}
}

//验证地址密码
function checkAddrPwd(addr, pwd) {
	var allAccount = readStorage('account');
	for (var key in allAccount) {
		if (allAccount[key].addr == addr) {
			var code = allAccount[key].code;
			var prk = cryptoDecrypt(code, pwd);
			if (!prk) {
				return {
					"error": "密码错误"
				};
			} else {
				return prk;
			}
		}
	}
	return {
		"error": "钱包地址错误"
	};
}

//删除所有帐号信息
function clearAccount() {
	// storage.removeItem("account");
}

//打开窗口
function openWindow(url, t, ws) {
	var openw = null;
	if (openw) { //避免多次打开同一个页面
		return null;
	}
	var as = 'pop-in';
	ws = ws || {};
	ws.scrollIndicator || (ws.scrollIndicator = 'none');
	ws.scalable || (ws.scalable = false);
	ws.backButtonAutoControl || (ws.backButtonAutoControl = 'close');
	ws.titleNView = ws.titleNView || {};
	ws.titleNView.autoBackButton = true;
	ws.titleNView.backgroundColor = '#FFFFFF';
	ws.titleNView.titleColor = '#000000';
	t && (ws.titleNView.titleText = t);
	as && (as = ws.aniShow);
	openw = plus.webview.create(url, url, ws);
	openw.addEventListener('loaded', function() {
		openw.show(as);
		// openw.show('slide-in-left');
	}, false);
	openw.addEventListener('close', function() {
		openw = null;
	}, false);
}

//mui.ajax
function mui_ajax(url, value, type, dataType) {
	//console.log(value);
	var result = "";
	mui.ajax(url, {
		data: value,
		async: false,
		dataType: dataType,
		type: type, //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		headers: {
			'Content-Type': 'text/plain'
		},
		success: function(data) {
			result = data;
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			result = xhr.responseText;
		}
	});
	return result;
}

//时间戳格式转换
function format(shijianchuo) {
	//shijianchuo是整数，否则要parseInt转换
	var time = new Date(shijianchuo);
	var y = time.getFullYear();
	var m = time.getMonth() + 1;
	var d = time.getDate();
	var h = time.getHours();
	var mm = time.getMinutes();
	var s = time.getSeconds();
	return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}

function add0(m) {
	return m < 10 ? '0' + m : m
}

function timestamp2date(timestamp) {
	var date = new Date(timestamp);
	Y = date.getFullYear() + '-';
	M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
	D = date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' ';
	h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
	m = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':';
	s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
	return Y + M + D + h + m + s;
}

function jumppage(url) {
	window.location.href = url;
}

//截取地址保留首尾,中间省略号代替
function cutAddr(addr) {
	//var addr = "QY67JpG24EdkJ1AP4Ewr8FNvMoeyxGKEzP";
	var arrAddr = addr.trim().split("");
	var str = "";
	//console.log(arrAddr);
	for (var key in arrAddr) {
		if (key < 10 || key > arrAddr.length - 11) {
			str += arrAddr[key];
		} else if (key == 12) {
			str += "...";
		}
	}
	return str;
}

//获取地址栏传参
function getParam(key) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == key) {
			return pair[1];
		}
	}
	return ("");
}

//获取所有webview
function getAW() {
	var wvs = plus.webview.all();
	for (var i = 0; i < wvs.length; i++) {
		console.log('webview' + i + ': ' + wvs[i].id);
	}
}

//获取所有localStorage
function getLS() {
	var storage = window.localStorage;
	for (var i = 0, len = storage.length; i < len; i++) {
		var key = storage.key(i);
		var value = storage.getItem(key);
		console.log(key + "=" + value);
	}
}

//检查收藏状态
function checkFavoriteAssets(assetId) {
	var isFavorite = false;
	var favoriteAssetsInfo = readStorage('favoriteAssetsInfo')
	for (var i = 0, len = favoriteAssetsInfo.length; i < len; i++) {
		// console.log(favoriteAssetsInfo[i].assetId)
		if (favoriteAssetsInfo[i].assetId == assetId) {
			isFavorite = true;
			break;
		}
	}
	return isFavorite;
}

function searchAssetInfo(type, condition) {
	var allAssetsInfo = readStorage('allAssetsInfo');
	if (type == "id") {
		for (var i = 0, len = allAssetsInfo.length; i < len; i++) {
			if (allAssetsInfo[i].assetId == condition) {
				return allAssetsInfo[i];
				break;
			}
		}
	} else if (type == "name") {
		for (var i = 0, len = allAssetsInfo.length; i < len; i++) {
			if (allAssetsInfo[i].name == condition) {
				return allAssetsInfo[i];
				break;
			}
		}
	}

}





function backListener() {
	console.log('backbutton');
}

//转换小数
function conversionDecimal(num, type, zeroFill, len) {
	if (type == 1) {
		//不四舍五入
		if (zeroFill == true) {
			return parseFloat(Math.floor(num * Math.pow(10, len)) / Math.pow(10, len)).toFixed(len);
		} else {
			return Math.floor(num * Math.pow(10, len)) / Math.pow(10, len);
		}
	} else if (type == 2) {
		//四舍五入
	}
}


function clearNoNum(obj, len) {
	// console.log(obj)
	obj.value = obj.value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符  
	obj.value = obj.value.replace(/^\./g, ""); //验证第一个字符是数字而不是  
	obj.value = obj.value.replace(/\.{2,}/g, ""); //只保留第一个. 清除多余的  
	obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
	var re = new RegExp("^(\\-)*(\\d+)\\.(\\d{" + len + "}).*$");
	obj.value = obj.value.replace(re, '$1$2.$3');
}






/* *
 *合并订单相同价格的数量
 *已提供新接口，弃用
 * 
 * */

// function trans(arr) {
// 	var obj = {}
// 	var result = []
// 	arr.forEach(({
// 		price,
// 		amount,
// 		fulfilled
// 	}) => {
// 		let cur = obj[price]
// 
// 		if (cur) {
// 			let index = cur.index
// 			result[index].amount = (parseFloat(result[index].amount) + parseFloat(amount - fulfilled)).toFixed(8)
// 		} else {
// 			let index = result.length
// 
// 			obj[price] = {
// 				price,
// 				index
// 			}
// 			amount = amount - fulfilled;
// 			result.push({
// 				price,
// 				amount
// 			})
// 		}
// 
// 	})
// 	return result
// }


function trans(arr) {
  var obj = {};
  var result = [];
  arr.forEach(function (_ref) {
    var price = _ref.price,
        amount = _ref.amount,
        fulfilled = _ref.fulfilled;
    var cur = obj[price];

    if (cur) {
      var index = cur.index;
      result[index].amount = (parseFloat(result[index].amount) + parseFloat(amount - fulfilled)).toFixed(8);
    } else {
      var _index = result.length;
      obj[price] = {
        price: price,
        index: _index
      };
      amount = amount - fulfilled;
      result.push({
        price: price,
        amount: amount
      });
    }
  });
  return result;
}