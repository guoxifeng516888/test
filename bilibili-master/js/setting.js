var YZN = {
	versions: function() {
		var u = navigator.userAgent,
			app = navigator.appVersion;
		return {
			trident: u.indexOf('Trident') > -1, //IE内核
			presto: u.indexOf('Presto') > -1, //opera内核
			webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
			gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
			mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
			ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
			android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
			iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
			iPad: u.indexOf('iPad') > -1, //是否iPad
			webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
			weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
			qq: u.match(/\sQQ/i) == " qq" //是否QQ
		};
	}(),
	'start': function() {
		$.ajax({
			url: "/v1/admin/api.php",
			dataType: "json",
			success: function(e) {
				YZN.waittime = e.data.waittime
				YZN.ads = e.data.ads;
				config.logo = e.data.logo;
				up.pbgjz = e.data.pbgjz;
				up.trysee = e.data.trytime;
				config.sendtime = e.data.sendtime;
				config.color = e.data.color;
				//config.group_x = YZN.ads.set.group;
				config.dmrule = e.data.dmrule;
				//config.group = YZN.getCookie('group_id');
				danmuon = e.data.danmuon;
				config.url = YZN.decrypt(config.url);//解密播放地址
				if (config.group < config.group_x && YZN.ads.state == 'on' && config.group != '') {
					if (YZN.ads.set.state == '1') {
						YZN.MYad.vod(YZN.ads.set.vod.url, YZN.ads.set.vod.link);
					} else if (YZN.ads.set.state == '2') {
						YZN.MYad.pic(YZN.ads.set.pic.link, YZN.ads.set.pic.time, YZN.ads.set.pic.img);
					}
				} else {
					YZN.play(config.url);
				}
			}
		});
	},
	
	'decrypt': function(url) {
	    var code = 'YS8bNTb4pKiH4BUG';
	    var code = CryptoJS.MD5(code).toString();
        var iv = CryptoJS.enc.Utf8.parse(code.substring(0,16));
        var key = CryptoJS.enc.Utf8.parse(code.substring(16));
        return CryptoJS.AES.decrypt(url,key,{iv:iv,padding:CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);
    },
	
	'play': function(url) {
		if (!danmuon) {
			YZN.player.play(url);
		} else {
			if (config.av != '') {
				YZN.player.bdplay(url);
			} else {
				YZN.player.dmplay(url);
			}
		}
		$(function() {
			$(".yzmplayer-setting-speeds,.yzmplayer-setting-speed-item").on("click", function() {
				$(".speed-stting").toggleClass("speed-stting-open");
			});
			$(".speed-stting .yzmplayer-setting-speed-item").click(function() {
				$(".yzmplayer-setting-speeds  .title").text($(this).text());
			});
		});
		$(".yzmplayer-fulloff-icon").on("click", function() {
			YZN.dp.fullScreen.cancel();
		});
		$(".yzmplayer-showing").on("click", function() {
			YZN.dp.play();
			$(".vod-pic").remove();
		});
		$(".yzmplayer-full-hzh-icon").on("click", function() {
		    setTimeout(function(){
			if(!document.pictureInPictureElement){
			    layer.msg("当前浏览器似乎不支持呢(ง •_•)ง");
			}},700)
		});
		if (config.title != '') {
			$("#vodtitle").html(config.title + '  ' + config.sid);
		};
		
		(function(){
      //  $('.yzmplayer-menu').remove();
        $('.yzmplayer-video').attr('x5-video-player-type', 'h5-page');//禁止X5播放器
        //滑动快进快退
        if(!('ontouchstart' in document.documentElement)) {return;}
        //禁止移动端jquery菜单
        $(".yzmplayer-video-wrap").ready(function(){
        $(".yzmplayer-video-wrap").bind("contextmenu",function(e){return false;});
        });
        //禁止其他滑动的事件
        $(".yzmplayer-video-wrap")[0].addEventListener('touchmove',
        function(event) {
            event = event ? event: window.event;
            if (event.preventDefault) event.preventDefault();
            else event.returnValue = false;
        },
        false);
        var startX, startY, endX, endY, diff, isSetFlag, currentTime, setTime, timeout;
        function touchStart(e) {
            var touch = e.touches[0];
            diff = 0;
            startX = touch.pageX;
            startY = touch.pageY;
            timeout = setTimeout(function(){YZN.dp.speed(3)},700);//长按3倍速，延时700ms
        }
        function touchMove(e) {
            var touch = e.touches[0];
            endX = touch.pageX;
            endY = touch.pageY;
            diff = endX - startX;
            clearTimeout(timeout);//滑动就结束计时，防止快进和倍速同时进行
            if (endY - startY > -25 && Math.abs(diff) > 25) {//非上滑
            	   var tmpDiff = diff > 0 ? diff - 25 : diff + 25;//恢复diff取值偏移25
            	   if(!isSetFlag) {//增加一个25的误触范围
                    //YZN.dp.pause();
                    $(".yzmplayer-notice").css("opacity", "0.8");
                    isSetFlag=true;
            	   }
            	   var max = YZN.dp.video.duration - YZN.dp.video.currentTime;
            	   var min = YZN.dp.video.currentTime;
            	   tmpDiff = (tmpDiff>0 && tmpDiff>max) ? max : ((tmpDiff<0 && tmpDiff<-min) ? -min : tmpDiff);//设置上下限
            	   tmpDiff = Math.floor(tmpDiff);
                currentTime = YZN.dp.video.currentTime;
                setTime = currentTime+tmpDiff;//设置跳转时间
                var text = YZN.formatTime(currentTime+tmpDiff) + '/' + YZN.formatTime(YZN.dp.video.duration);
                text = (tmpDiff > 0 ? "快进 " + Math.abs(tmpDiff) + " 秒" : "快退 " + Math.abs(tmpDiff) + " 秒") + "，" + text + "，上滑取消";
                $(".yzmplayer-notice").text(text);
            } else {
                $(".yzmplayer-notice").text("取消");
                diff = 0;
            }
        }
        function touchEnd(e) {
            //console.log(endY - startY > -25);
            clearTimeout(timeout);//手指离开屏幕就结束计时，防止死循环
            YZN.dp.speed(1);//恢复正常速度
            if (endY - startY > -25 && Math.abs(diff) > 25) {//上滑取消判定
                YZN.dp.video.currentTime = setTime;
                YZN.dp.danmaku && YZN.dp.danmaku.seek();
            }
            //dp.play();
            isSetFlag=false;
            $(".yzmplayer-notice").css("opacity", "0");
        }
        $(".yzmplayer-video-wrap")[0].addEventListener("touchstart", touchStart, false);
        $(".yzmplayer-video-wrap")[0].addEventListener("touchmove", touchMove, false);
        $(".yzmplayer-video-wrap")[0].addEventListener("touchend", touchEnd, false);
      })();
		
	},
	'dmid': function() {
		if (up.diyid[0] == 0 && config.id != '') {
			a = config.id,
				b = config.sid
		} else if (up.diyid[0] == 1 || !config.id) {
			a = up.diyid[1],
				b = up.diyid[2]
		}
		YZN.id = a + ' P' + b
	},
	'load': function() {
		setTimeout(function() {
			$("#link1").fadeIn();
		}, 100);
		setTimeout(function() {
			$("#link1-success").fadeIn();
		}, 500);
		setTimeout(function() {
			$("#link2").show();
		}, 1 * 1000);
		setTimeout(function() {
			$("#link3,#span").fadeIn();
		}, 2 * 1000);
		if (YZN.versions.weixin && (YZN.versions.ios || YZN.versions.iPad)) {
			/*var css = '<style type="text/css">';
			css += '#loading-box{display: none;}';
			css += '</style>';
			$('body').append(css).addClass*/
            $('#loading-box').css('display','none');
		}
		YZN.danmu.send();
		YZN.danmu.list();
		YZN.def();
		YZN.video.try();
		YZN.dp.danmaku.opacity(1);
	},
	'def': function() {
		console.log('播放器开启');
		YZN.stime = 0;
		YZN.headt = yzmck.get("headt");
		YZN.lastt = yzmck.get("lastt");
		YZN.last_tip = parseInt(YZN.lastt) + 10;
		YZN.frists = yzmck.get('frists');
		YZN.lasts = yzmck.get('lasts');
		YZN.playtime = Number(YZN.getCookie("time_" + config.url));
		YZN.ctime = YZN.formatTime(YZN.playtime);
		YZN.dp.on("loadedmetadata", function() {
			YZN.loadedmetadataHandler();
		});
		YZN.dp.on("ended", function() {
			YZN.endedHandler();
		});
		YZN.dp.on('pause', function() {
			YZN.MYad.pause.play(YZN.ads.pause.link, YZN.ads.pause.pic);
		});
		YZN.dp.on('play', function() {
			YZN.MYad.pause.out();
		});
		YZN.dp.on('timeupdate', function(e) {
			YZN.timeupdateHandler();
		});
		YZN.jump.def()

	},
	'video': {
		'play': function() {
			$("#link3").text("视频已准备就绪，即将为您播放");
			/*setTimeout(function() {
				YZN.dp.play();
				//$("#loading-box").remove();分离加载页，下同
				$("#my-loading", parent.document).remove();
				YZN.jump.head();
			}, 1 * 1000);*/
			//取消延时播放
			    YZN.dp.play();
				$("#my-loading", parent.document).remove();
				YZN.jump.head();
		},
		'next': function() {
			top.location.href = up.mylink + config.next;
		},
		'try': function() {
			if (up.trysee > 0 && config.group < config.group_x && config.group != '') {
				$('#dmtext').attr({
					"disabled": true,
					"placeholder": "登陆后才能发弹幕yo(・ω・)"
				});
				setInterval(function() {
					var t = up.trysee * 60;
					var s = YZN.dp.video.currentTime;
					if (s > t) {
						YZN.dp.video.currentTime = 0;
						YZN.dp.pause();
						layer.confirm(up.trysee + "分钟试看已结束，请登录继续播放完整视频", {
							anim: 1,
							title: '温馨提示',
							btn: ['登录', '注册'],
							yes: function(index, layero) {
								top.location.href = up.mylink + "/index.php/user/login.html";
							},
							btn2: function(index, layero) {
								top.location.href = up.mylink + "/index.php/user/reg.html";
							}
						});
					}
				}, 1000);
			};
		},
		'seek': function() {
			YZN.dp.seek(YZN.playtime);
		},
		'end': function() {
			layer.msg("播放结束啦=。=");
		},
		'con_play': function() {
			if (!danmuon) {
				YZN.jump.head();
			} else {
				var conplayer =
					` <e>已播放至${YZN.ctime}，继续上次播放？</e><d class="conplay-jump">是 <i id="num">${YZN.waittime}</i>s</d><d class="conplaying">否</d>`
				$("#link3").html(conplayer);
				var span = document.getElementById("num");
				var num = span.innerHTML;
				var timer = null;
				setTimeout(function() {
					timer = setInterval(function() {
						num--;
						span.innerHTML = num;
						if (num == 0) {
							clearInterval(timer);
							//YZN.video.seek();
							//这里是默认回到记忆位置，我把它注释掉了，让它默认从头播放，根据你的需要选择是否注释
							YZN.dp.play();
							$(".memory-play-wrap,#loading-box").remove();
						}
					}, 1000);
				}, 1);
			};
			var cplayer =
				`<div class="memory-play-wrap"><div class="memory-play"><span class="close">×</span><span>上次看到 </span><span>${YZN.ctime}</span><span class="play-jump">跳转播放</span></div></div>`
			$("#my-loading", parent.document).remove();
			$(".yzmplayer-cplayer").append(cplayer);
			
			$("#my-loading", parent.document).remove();
			YZN.dp.play();
			
			$(".close").on("click", function() {
				$(".memory-play-wrap").remove();
			});
			setTimeout(function() {
				$(".memory-play-wrap").remove();
			}, 20 * 1000);
			$(".conplaying").on("click", function() {
				clearTimeout(timer);
				$("#loading-box").remove();
				YZN.dp.play();
				YZN.jump.head();
			});
			$(".conplay-jump,.play-jump").on("click", function() {
				clearTimeout(timer);
				YZN.video.seek();
				$(".memory-play-wrap,#loading-box").remove();
				YZN.dp.play();
			});

		}
	},
	'jump': {
		'def': function() {
			h = ".yzmplayer-setting-jfrist label";
			l = ".yzmplayer-setting-jlast label";
			f = "#fristtime";
			j = "#jumptime";
			a(h, 'frists', YZN.frists, 'headt', YZN.headt, f);
			a(l, 'lasts', YZN.lasts, 'lastt', YZN.lastt, j);

			function er() {
				layer.msg("请输入有效时间哟！");
			}

			function su() {
				layer.msg("设置完成，将在刷新或下一集生效");
			}

			function a(b, c, d, e, g, t) {
				$(b).on("click", function() {
					o = $(t).val();
					if (o > 0) {
						$(b).toggleClass('checked');
						su();
						g = $(t).val();
						yzmck.set(e, g);
					} else {
						er()
					};
				});
				if (d == 1) {
					$(b).addClass('checked');
					$(b).click(function() {
						o = $(t).val();
						if (o > 0) {
							yzmck.set(c, 0);
						} else {
							er()
						};
					});
				} else {
					$(b).click(function() {
						o = $(t).val();
						if (o > 0) {
							yzmck.set(c, 1);
						} else {
							er()
						};
					});
				}
			};
			$(f).attr({
				"value": YZN.headt
			});
			$(j).attr({
				"value": YZN.lastt
			});
			YZN.jump.last();
		},
		'head': function() {
			if (YZN.stime > YZN.playtime) YZN.playtime = YZN.stime;
			if (YZN.frists == 1) {
				if (YZN.headt > YZN.playtime || YZN.playtime == 0) {
					YZN.jump_f = 1
				} else {
					YZN.jump_f = 0
				}
			}
			if (YZN.jump_f == 1) {
				YZN.dp.seek(YZN.headt);
				YZN.dp.notice("已为您跳过片头");
			}
		},
		'last': function() {
			if (config.next != '') {
				if (YZN.lasts == 1) {
					setInterval(function() {
						var e = YZN.dp.video.duration - YZN.dp.video.currentTime;
						if (e < YZN.last_tip) YZN.dp.notice('即将为您跳过片尾');
						if (YZN.lastt > 0 && e < YZN.lastt) {
							YZN.setCookie("time_" + config.url, "", -1);
							YZN.video.next();
						};
					}, 1000);
				};
			} else {
				$(".icon-xj").remove();
			};
		},
		'ad': function(a, b) {}
	},
	'danmu': {
		'send': function() {
			g = $(".yzm-yzmplayer-send-icon");
			d = $("#dmtext");
			h = ".yzmplayer-comment-setting-";
			$(h + "color input").on("click", function() {
				r = $(this).attr("value");
				setTimeout(function() {
					d.css({
						"color": r
					});
				}, 100);
			});
			$(h + "type input").on("click", function() {
				t = $(this).attr("value");
				setTimeout(function() {
					d.attr("dmtype", t);
				}, 100);
			});

			$(h + "font input").on("click", function() {
				if (up.trysee > 0 && config.group == config.group_x) {
					layer.msg("会员专属功能");
					return;
				};
				t = $(this).attr("value");
				setTimeout(function() {
					d.attr("size", t);
				}, 100);
			});
			g.on("click", function() {
				a = document.getElementById("dmtext");
				a = a.value;
				b = d.attr("dmtype");
				c = d.css("color");
				z = d.attr("size");
				if (up.trysee > 0 && config.group < config.group_x && config.group != '') {
					layer.msg("登陆后才能发弹幕yo(・ω・)");
					return;
				}
				for (var i = 0; i < up.pbgjz.length; i++) {
					if (a.search(up.pbgjz[i]) != -1) {
						layer.msg("请勿发送无意义内容，规范您的弹幕内容");
						return;
					}
				}
				if (a.length < 1) {
					layer.msg("要输入弹幕内容啊喂！");
					return;
				}
				var e = Date.parse(new Date());
				var f = yzmck.get('dmsent', e);
				if (e - f < config.sendtime * 1000) {
					layer.msg('请勿频繁操作！发送弹幕需间隔' + config.sendtime + '秒~');
					return;
				}
				d.val("");
				YZN.dp.danmaku.send({
					text: a,
					color: c,
					type: b,
					size: z
				});
				yzmck.set('dmsent', e);
			});

			function k() {
				g.trigger("click");
			};
			d.keydown(function(e) {
				if (e.keyCode == 13) {
					k();
				};
			});
		},
		'list': function() {
			$(".yzmplayer-list-icon,.yzm-yzmplayer-send-icon").on("click", function() {
				$(".list-show").empty();
				$.ajax({
					url: config.api + "?ac=get&id=" + YZN.id,
					success: function(d) {
						if (d.code == 23) {
							a = d.danmuku;
							b = d.name;
							c = d.danum;
							$(".danmuku-num").text(c)
							$(a).each(function(index, item) {
								l =
									`<d class="danmuku-list" time="${item[0]}"><li>${YZN.formatTime(item[0])}</li><li title="${item[4]}">${item[4]}</li><li title="用户：${item[3]}  IP地址：${item[5]}">${item[6]}</li><li class="report" onclick="YZN.danmu.report(\'${item[5]}\',\'${b}\',\'${item[4]}\',\'${item[3]}\')">举报</li></d>`
								$(".list-show").append(l);
							})
						}
						$(".danmuku-list").on("dblclick", function() {
							YZN.dp.seek($(this).attr("time"))
						})
					}
				});
			});
			var liyih = '<div class="dmrules"><a target="_blank" href="' + config.dmrule + '">弹幕礼仪 </a></div>';
			$("div.yzmplayer-comment-box:last").append(liyih);
			$(".yzmplayer-watching-number").text(up.usernum);
			$(".yzmplayer-info-panel-item-title-amount .yzmplayer-info-panel-item-title").html("违规词");
			for (var i = 0; i < up.pbgjz.length; i++) {
				var gjz_html = "<e>" + up.pbgjz[i] + "</e>";
				$("#vod-title").append(gjz_html);
			}
			add('.yzmplayer-list-icon', ".yzmplayer-danmu", 'show');

			function add(div1, div2, div3, div4) {
				$(div1).click(function() {
					$(div2).toggleClass(div3);
					$(div4).remove();
				});
			}
		},
		'report': function(a, b, c, d) {
			layer.confirm('' + c + '<!--br><br><span style="color:#333">请选择需要举报的类型</span-->', {
				anim: 1,
				title: '举报弹幕',
				btn: ['违法违禁', '色情低俗', '恶意刷屏', '赌博诈骗', '人身攻击', '侵犯隐私', '垃圾广告', '剧透', '引战'],
				btn3: function(index, layero) {
					YZN.danmu.post_r(a, b, c, d, '恶意刷屏');
				},
				btn4: function(index, layero) {
					YZN.danmu.post_r(a, b, c, d, '赌博诈骗');
				},
				btn5: function(index, layero) {
					YZN.danmu.post_r(a, b, c, d, '人身攻击');
				},
				btn6: function(index, layero) {
					YZN.danmu.post_r(a, b, c, d, '侵犯隐私');
				},
				btn7: function(index, layero) {
					YZN.danmu.post_r(a, b, c, d, '垃圾广告');
				},
				btn8: function(index, layero) {
					YZN.danmu.post_r(a, b, c, d, '剧透');
				},
				btn9: function(index, layero) {
					YZN.danmu.post_r(a, b, c, d, '引战');
				}
			}, function(index, layero) {
				YZN.danmu.post_r(a, b, c, d, '违法违禁');
			}, function(index) {
				YZN.danmu.post_r(a, b, c, d, '色情低俗');
			});
		},
		'post_r': function(a, b, c, d, type) {
			$.ajax({
				type: "get",
				url: config.api + '?ac=report&cid=' + d + '&user=' + a + '&type=' + type + '&title=' + b + '&text=' + c,
				cache: false,
				dataType: 'json',
				beforeSend: function() {},
				success: function(data) {
					layer.msg("举报成功！感谢您为守护弹幕作出了贡献");
				},
				error: function(data) {
					var msg = "服务故障 or 网络异常，稍后再试6！";
					layer.msg(msg);
				}
			});
		}
	},
	'setCookie': function(c_name, value, expireHours) {
		var exdate = new Date();
		exdate.setHours(exdate.getHours() + expireHours);
		document.cookie = c_name + "=" + escape(value) + ((expireHours === null) ? "" : ";expires=" + exdate.toGMTString());
	},
	'getCookie': function(c_name) {
		if (document.cookie.length > 0) {
			c_start = document.cookie.indexOf(c_name + "=");
			if (c_start !== -1) {
				c_start = c_start + c_name.length + 1;
				c_end = document.cookie.indexOf(";", c_start);
				if (c_end === -1) {
					c_end = document.cookie.length;
				};
				return unescape(document.cookie.substring(c_start, c_end));
			}
		}
		return "";
	},
	'formatTime': function(seconds) {
		return [parseInt(seconds / 60 / 60), parseInt(seconds / 60 % 60), parseInt(seconds % 60)].join(":").replace(
			/\b(\d)\b/g, "0$1");
	},
	'loadedmetadataHandler': function() {
		if (YZN.playtime > 0 && YZN.dp.video.currentTime < YZN.playtime) {
			setTimeout(function() {
				YZN.video.con_play()
			}, 1 * 1000);
		} else {
			setTimeout(function() {
				if (!danmuon) {
					YZN.jump.head();
				} else {
					YZN.dp.notice("视频已准备就绪，即将为您播放");
					
					$("#my-loading", parent.document).remove();
					
					YZN.video.play()
				}
			}, 0);

		}
		YZN.dp.on("timeupdate", function() {
			YZN.timeupdateHandler();
		});
	},
	'timeupdateHandler': function() {
		YZN.setCookie("time_" + config.url, YZN.dp.video.currentTime, 24);
	},
	'endedHandler': function() {
		YZN.setCookie("time_" + config.url, "", -1);
		if (config.next != '') {
			YZN.dp.notice("5s后,将自动为您播放下一集");
			setTimeout(function() {
				YZN.video.next();
			}, 5 * 1000);
		} else {
			YZN.dp.notice("视频播放已结束");
			setTimeout(function() {
				YZN.video.end();
			}, 2 * 1000);
		}
	},
	'player': {
		'play': function(url) {
			$('body').addClass("danmu-off");
			YZN.dp = new yzmplayer({
				autoplay: true,
				element: document.getElementById('player'),
				theme: config.color,
				logo: config.logo,
				video: {
					url: url,
					pic: config.pic,
					type: 'auto',
				},
			});
			/*var css = '<style type="text/css">';
			css += '#loading-box{display: none;}';
			css += '</style>';
			$('body').append(css).addClass("");*/
			$('#loading-box').css('display','none');
			YZN.def();
			//YZN.jump.head();				
		},
		'adplay': function(url) {
			$('body').addClass("danmu-off");
			YZN.ad = new yzmplayer({
				autoplay: true,
				element: document.getElementById('ADplayer'),
				theme: config.color,
				logo: config.logo,
				video: {
					url: url,
					pic: config.pic,
					type: 'auto',
				},
			});
			$('.yzmplayer-controller,.yzmplayer-cplayer,.yzmplayer-logo,#loading-box,.yzmplayer-controller-mask').remove();
			$('.yzmplayer-mask').show();
			YZN.ad.on('timeupdate', function() {
				if (YZN.ad.video.currentTime > YZN.ad.video.duration - 0.1) {
					$('body').removeClass("danmu-off");
					YZN.ad.destroy();
					$("#ADplayer").remove();
					$("#ADtip").remove();
					YZN.play(config.url);
				}
			});
		},
		'dmplay': function(url) {
			YZN.dmid();
			YZN.dp = new yzmplayer({
				autoplay: false,
				element: document.getElementById('player'),
				theme: config.color,
				logo: config.logo,
				video: {
					url: url,
					pic: config.pic,
					type: 'auto',
				},
				danmaku: {
					id: YZN.id,
					api: config.api + '?ac=dm',
					user: config.user
				}
			});
			YZN.load();

		},
		'bdplay': function(url) {
			YZN.dmid();
			YZN.dp = new yzmplayer({
				autoplay: false,
				element: document.getElementById('player'),
				theme: config.color,
				logo: config.logo,
				video: {
					url: url,
					pic: config.pic,
					type: 'auto',
				},
				danmaku: {
					id: YZN.id,
					api: config.api + '?ac=dm',
					user: config.user,
					addition: [config.api + 'bilibili/?av=' + config.av]
				}
			});
			YZN.load();
		}
	},
	'MYad': {
		'vod': function(u, l) {
			$("#ADtip").html('<a id="link" href="' + l + '" target="_blank">查看详情</a>');
			$("#ADplayer").click(function() {
				document.getElementById('link').click();
			});
			YZN.player.adplay(u);
		},
		'pic': function(l, t, p) {
			$("#ADtip").html('<a id="link" href="' + l + '" target="_blank">广告 <e id="time_ad">' + t + '</e></a><img src="' +
				p + '">');
			$("#ADtip").click(function() {
				document.getElementById('link').click();
			});
			var span = document.getElementById("time_ad");
			var num = span.innerHTML;
			var timer = null;
			setTimeout(function() {
				timer = setInterval(function() {
					num--;
					span.innerHTML = num;
					if (num == 0) {
						clearInterval(timer);
						YZN.play(config.url);
						$('#ADtip').remove();
					}
				}, 1000);
			}, 1);

		},
		'pause': {
			'play': function(l, p) {
				if (YZN.ads.pause.state == 'on') {
					var pause_ad_html = '<div id="player_pause"><div class="tip">广告</div><a href="' + l +
						'" target="_blank"><img src="' + p + '"></a></div>';
					$('#player').before(pause_ad_html);
				}
			},
			'out': function() {
				$('#player_pause').remove();
			}	
		}
	}
}
// 控制台报错
//setInterval(function() {
//window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized ? t("on") : (a = "off", ("undefined"!==typeof console.clear) && console.clear());
//debugger;
//}, 10);