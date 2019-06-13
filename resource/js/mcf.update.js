var checkUrl = "https://mcfamily.io/mcf/api/getVersionAndroidTest";

function checkUpdate(type) {
	// console.log(type)
	// plus.nativeUI.showWaiting("检测更新...");
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		switch (xhr.readyState) {
			case 4:
				plus.nativeUI.closeWaiting();
				if (xhr.status == 200) {
					// console.log("检测更新成功：" + xhr.responseText);
					var versionInfo = JSON.parse(xhr.responseText)
					// console.log(versionInfo.varsion)
					var newVer = versionInfo.varsion;
					if (wgtVer && newVer && (wgtVer != newVer)) {
						console.log("有更新");
						var btnArray = ['否', '是'];
						mui.confirm('检测到更新\n是否立即更新', '更新', btnArray, function(e) {
							if (e.index == 1) {
								console.log("更新");
								downWgt(versionInfo.updateUrl);
							} else {
								console.log("不更新")
							}
						})
						// downWgt(); // 下载升级包  
					} else {
						// console.log(type);
						if(type=="user"){
							plus.nativeUI.alert("无新版本可更新！");
						}
					}
				} else {
					console.log("检测更新失败！");
					plus.nativeUI.alert("检测更新失败！");
				}
				break;
			default:
				break;
		}
	}
	xhr.open('GET', checkUrl);
	xhr.send();
}

function downWgt(wgtUrl) {
	console.log(wgtUrl);
	plus.nativeUI.showWaiting("下载wgt文件...");
	plus.downloader.createDownload(wgtUrl, {
		filename: "_doc/update/"
	}, function(d, status) {
		if (status == 200) {
			console.log("下载wgt成功：" + d.filename);
			installWgt(d.filename); // 安装wgt包  
		} else {
			console.log("下载wgt失败！");
			plus.nativeUI.alert("下载wgt失败！");
		}
		plus.nativeUI.closeWaiting();
	}).start();
}

// 更新应用资源  
function installWgt(path) {
	plus.nativeUI.showWaiting("安装wgt文件...");
	plus.runtime.install(path, {}, function() {
		plus.nativeUI.closeWaiting();
		console.log("安装wgt文件成功！");
		plus.nativeUI.alert("应用资源更新完成！", function() {
			plus.runtime.restart();
		});
	}, function(e) {
		plus.nativeUI.closeWaiting();
		console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
		plus.nativeUI.alert("安装wgt文件失败[" + e.code + "]：" + e.message);
	});
}
