var check = (function() {
	var c = [],
		timeLimit = 50,
		open = false;
	setInterval(loop, 1);
	return {
		addListener: function(a) {
			c.push(a)
		},
		cancleListenr: function(a) {
			c = c.filter(function(v) {
				return v !== a
			})
		}
	}
	function loop() {
		var b = new Date();
		debugger;
		if (new Date() - b > timeLimit) {
			if (!open) {
				c.forEach(function(a) {
					a.call(null)
				})
			}
			open = true;
			window.stop()
		} else {
			open = false
		}
	}
})();
!function(e){function n(e){function n(){return u}function o(){window.Firebug&&window.Firebug.chrome&&window.Firebug.chrome.isInitialized?t("on"):(a="off",console.log(d),console.clear(),t(a))}function t(e){u!==e&&(u=e,"function"==typeof c.onchange&&c.onchange(e))}function r(){l||(l=!0,window.removeEventListener("resize",o),clearInterval(f))}"function"==typeof e&&(e={onchange:e});var i=(e=e||{}).delay||500,c={};c.onchange=e.onchange;var a,d=new Image;d.__defineGetter__("id",function(){a="on"});var u="unknown";c.getStatus=n;var f=setInterval(o,i);window.addEventListener("resize",o);var l;return c.free=r,c}var o=o||{};o.create=n,"function"==typeof define?(define.amd||define.cmd)&&define(function(){return o}):"undefined"!=typeof module&&module.exports?module.exports=o:window.jdetects=o}(),jdetects.create(function(e){var a=0;var n=setInterval(function(){if("on"==e){setTimeout(function(){if(a==0){a=1;top.location.href='https://www.baidu.com'}},200)}},100)});var u;function setvideourl(a){u=a;document.getElementById("video").src=u}