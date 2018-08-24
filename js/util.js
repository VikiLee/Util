;(function() {
  var Util = {};

  var emptyFunc = function() {}

  /**
   * 判断obj是否为普通对象
   * @param obj 被判断对象
   */
  Util.isPlainObject = function(obj) {
    // 排除简单类型/node对象/window对象
    if(typeof obj !== "object" || obj.nodeType || obj.self === self) {
      return false;
    }

    // RegExp对象和Array排除
    if(obj.construtor && !Object.prototype.hasOwnProperty.call(obj.construtor, "isPrototypeOf")) {
      return false;
    }

    return true;

  }

  /**
   * 复制对象，第一个参数是目标，第二个三个...是被复制对象，最后一个参数，如果是布尔值，则是是否深复制的参数
   */
  Util.extend = function() {
    var target = arguments[0], // 目标对象
      copy = null, // 被复制对象
      targetAttribute = null, // 被复制对象的某个属性，有可能还是object类型或者array类型
      length = arguments.length,
      i = 1,
      j = 0,
      isDeepCopy = false;

    // 如果最后一个参数是布尔值，则是是否深复制的变量，不是要复制的对象
    if(typeof arguments[length - 1] === "boolean") {
      isDeepCopy = arguments[length - 1];
      length -= 1; // 不复制该参数
    }

    for(; i < length; i++) {
      copy = arguments[i];
      if(copy) {
        for(var key in copy) {
          // 不复制原形链里面的属性
          if(copy.hasOwnProperty(key)) {
            if(isDeepCopy && this.isPlainObject(copy[key])) {
              // 如果是普通对象
              targetAttribute = this.isPlainObject(target[key]) ? target[key] : {};
              // 普通对象，通过递归调用的方式复制
              target[key] = this.extend(targetAttribute, copy[key], isDeepCopy);
            } else if(isDeepCopy && this.isArray(copy[key])) {
              // 如果是数组
              targetAttribute = this.isArray(target[key]) ? target[key] : [];
              // 数组对象，通过递归调用的方式复制
              target[key] = this.extend(targetAttribute, copy[key], isDeepCopy);
            } else {
              target[key] = copy[key];
            }
          }
        }
      }
    }
    return target;
  }

  /**
   * 判断对象是否是数组类型，规避了不同frame下判断数组不正确
   * @param arr 被判断对象
   */
  Util.isArray = function(arr) {
    return Object.prototype.toString.call(arr) === "[object Array]";
  }

  /**
   * 获取到obj对象的所有key的数组，不包括prototype的
   * @param obj
   */
  Util.keys = function(obj) {
    if(!this.isPlainObject(obj)) {
      throw new TypeError("argument must by object");
    }
    var keys = [];
    for(var key in obj) { 
      if(obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys
  }

  /**
   * 迭代obj对象/数组
   * @param obj 被迭代对象/数组
   * @param iterator 迭代器 第一个参数是对象的key/数组的下标, 第二个参数obj对应的是key/下标的值
   * @param context 迭代器方法里的上下文this
   */
  Util.each = function(obj, iterator, context) {
    if(!this.isPlainObject(obj) && !this.isArray(obj)) {
      throw new TypeError("iterator target must by object or array");
    }
    // 有原生的使用原生的
    if(obj.forEach) {
      return obj.forEach(iterator, context);
    }

    var i;
    if(this.isArray(obj)) {
      for(i = 0; i < obj.length; i++) {
        iterator.call(context, obj[i], i, obj);
      }
    } else {
      var keys = this.keys(obj);
      for(i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i], obj);
      }
    }
  }

  /**
   * 将object对象转为url的location.search字符串
   * @param data 要转换的对象
   */
  Util.formatParams = function (data) {
    var arr = [];
    this.each(data, function(value, key) {
      arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    });
    return arr.join("&");
  }

  /**
   * 获取指定cookie
   * @param name cookie名
   */
  Util.getCookie = function(name) {
    var matches = document.cookie.match(name + "=([^;]*)");
    return matches.length > 0 ? matches[1] : ""
  }

  /**
   * 设置cookie
   * @param name cookie name
   * @param value cookie value
   * @param days cookie过期天数
   */
  Util.setCookie = function(name, value, days) {
   var cookieStr = encodeURIComponent(name) + "+" + decodeURIComponent(value);
    if(days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      cookieStr += ";expires=" + date.toGMTString();
    }
    document.cookie = cookieStr;
  }

  /**
   * 删除cookie
   * @param name cookie name
   */
  Util.removeCookie = function(name) {
    Util.setCookie(name, "", -1);
  }

  /**
   * 函数节流
   * @param fn 要节流的函数
   * @param delay 多久执行一次
   * @param mustRunDelay 多久必须执行一次，该参数防止函数抖动
   */
  Util.throttle = function(fn, delay, mustRunDelay) {
    var timer = null;
    var t_start = null;
    return function() {
      clearTimeout(timer);
      var args = Array.prototype.slice.call(arguments);
      var t_current = new Date();
      if(!t_start) {
        t_start = t_current;
      }
      // 防止一直不执行，超过了某个时间必须执行以下，不然没有动画效果
      if(t_current - t_start >  mustRunDelay) {
        fn.apply(this, args);
        t_start = t_current;
      } else {
        // 延迟执行，避免频繁更新（尤其是DOM操作）
        timer = setTimeout(function() {
          fn.apply(this, args);
        }, delay);
      }
    }
  }

  /**
   * 获取到请求参数的值
   * @param name 参数名
   */
  Util.getParam = function(name) {
    var search = location.search;
    var matches = search.match("[?&]" + name + "=([^#&]+)");
    return matches.length > 0 ? matches[1] : "";
  }

  /**
   * 判断某个是否是有效的邮箱地址
   * @param 需要判断的邮箱
   */
  Util.isEmail = function(email) {
    return /[\w.]+@\w+(.\w+)+$/.test(email);
  }

  /**
   * 数组去重
   * @param array 原数组
   * @return 去重后的数组
   * es6的方式Util.es6Unique = (arr) => [...new Set(arr)]
   */
  Util.unique = function(array) {
    var temp = {},
      item = null,
      uniqueArr = [],
      i = 0;
    for(; i < array.length; i++) {
      item = array[i];
      // typeof item + JSON.stringify(item)可以防止1和"1"被判断为相同，也可以防止{value: 1}, {value: "1"}， 因为typeof item1 + item2会返回object[object Object]
      if(!obj[typeof item + JSON.stringify(item)]) {
        temp[typeof item + JSON.stringify(item)] = true;
        uniqueArr.push(item);
      }
    }
    return uniqueArr;
  }

  // Util.readableNumber = function(number) {
  //   if(isNaN(Number(number))) {
  //     throw TypeError('arugment must be number or can be transfer into number');
  //   }
  //   if(number == 0) return 0;
  //   var numberStr = '' + number,
  //     len = numberStr.length,
  //     index = - 3;

  //   // 第一步：最高位不足3的情况，用0补上
  //   switch(len % 3) {
  //     case 1: numberStr = '00' + numberStr; break;
  //     case 2: numberStr = '0' + numberStr; break;
  //   }
  //   var result = "";
  //   len = numberStr.length;
  //   // 第二步：从右往做，每隔三个位置打一个","
  //   while(-index <= len) {
  //     result =  numberStr.substr(index, 3) + ',' + result;
  //     index -= 3;
  //   }
  //   // 第三步：将第一步在前面添加的0去掉以及尾部多于的","也去掉
  //   return result.replace(/(^0+|,$)/g, '');
  // }

  // Util.readableNumber1 = function(number) {
  //   if(isNaN(Number(number))) {
  //     throw TypeError('arugment must be number or can be transfer into number');
  //   }
  //   if(number == 0) return 0;
  //   var numberStr = '' + number,
  //     len = numberStr.length
  //   // 第一步：最高位不足3的情况，用0补上
  //   switch(len % 3) {
  //     case 1: numberStr = '00' + numberStr; break;
  //     case 2: numberStr = '0' + numberStr; break;
  //   }
  //   // 第二步：每隔三个数字添加一个","，并将头部多于的0和尾部多于的","去掉
  //   return numberStr.replace(/(\d{3})/g, '$1,').replace(/(^0+|,$)/g, '');
  // }

  /**
   * 千位符
   * @param 要转为千位符的数字
   */
  Util.toThousands = function(number) {
    return (number + '').replace(/(\d+)(?=\.\d+)?/, function(number) {
      return number.replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    })
  }

  /**
   * 将data的键值对拼接成一个合法的url
   * @param url 原始url
   * @param data 键值对object
   */
  Util.generateUrl = function(url, data) {
    var queryString = this.formatParams(data);
    if(queryString) {
      // 有?的情况下，直接将data格式化后的search string append到后面
      if(url.indexOf("?") > -1) {
        url += queryString;
      } else {
        // 无?的情况下，添加?，然后再append到后面
        url += "?" + queryString;
      }
    }
    return url;
  }

  /**
   * jsonp函数
   * @param options 参数设置，与jquery ajax的参数一致
   * url 请求参数
   * jsonp 请求参数中传给后台的callback名，会被拼接到url中，比如jsonp=callback，url='http://www.xxx.com?callback=xxxx'
   * data 请求参数键值对
   * success 请求成功回调
   * fail 请求失败回调，目前失败只有超时一个原因
   */
  Util.jsonp = function(options) {
    var script = document.createElement("script"),
      head = document.querySelector("head")
      jsonp = options.jsonp || 'callback',
      success = options.success || emptyFunc,
      fail = options.fail || emptyFunc,
      timeout = options.timeout || 10000,
      data = options.data || {},
      url = options.url;
    

    // 注册jsonp回调函数，请求成功后自动执行
    var callbackFunction = ('jsonp_' + Math.random()).replace(/\./, '');
    window[callbackFunction] = function(json) {
      // 释放内存
      clearTimeout(timeout);
      window[callbackFunction] = null;
      head.removeChild(script);
      // 执行成功函数
      success(json);
    }
    
    // 发送请求
    data[jsonp] = callbackFunction;
    script.src = this.generateUrl(url, data);
    head.appendChild(script);

    // 超时处理
    var timeoutId = setTimeout(function() {
      // 释放内存
      window[callbackFunction] = null;
      head.removeChild(script);
      // 执行成功函数
      fail({message: 'timeout'});
    }, timeout);
  
  }

  /**
   * ajax请求
   * @param options 如jquery ajax
   */
  Util.ajax = function(options) {
    var type = options.type || 'GET',
      dataType = options.dataType || 'json',
      contentType = options.contentType || 'application/x-www-form-urlencoded'
      data = options.data || null,
      success = options.success || emptyFunc,
      url = options.url,
      timeout = options.timeout || 10000,
      async = options.async || true
      fail = options.fail || emptyFunc,
      timeoutId = null;

    if(!url) {
      return;
    }
    var xhr = null;
    if(XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      // for IE6 IE5
      xhr = new ActiveXObject("Microsoft.XMLHTTP")
    }

    if(dataType === "jsonp") {
      this.jsonp(options)
    } else {
      var sendData = null;
      if(type === 'GET') {
        url = this.generateUrl(url, data);
      } else {
        sendData = JSON.stringify(data);
      }
      xhr.open(type, url, async);
      xhr.setRequestHeader("content-type", contentType);
      xhr.send(sendData);
      xhr.onreadystatechange = function() {
        if(this.readyState === 4) {
          if(this.status === '200') {
            var resData = this.response || this.responseText; // IE9下是responseText
            success(resData);
          } else {
            fail(this.status, {message: this.statusText});
          }
        }
      }

      timeoutId = setTimeout(function() {
        xhr.abort();
        fail(408, {message: 'timeout'});
      }, timeout);
    }
  }

  /**
   * 格式化输出日期
   * @param date 时间
   * @param fmt 格式化 yyyy-MM-dd hh:mm:ss y：年 M: 月 d: 天 h: 小时 m: 分钟 s: 秒
   */
  Util.formatDate = function(date, fmt) {
    var regObj = {
      "M+": date.getMonth() +1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds()
    }

    if(/y+/.test(fmt)) {
      fmt = fmt.replace(/(y+)/, function(m) {
        return (date.getFullYear() + '').substr(4 - m.length)
      })
    }

    for(var key in regObj) {
      fmt = fmt.replace(new RegExp('(' + key + ')'), function(m) {
        var value = regObj[key];
        return m.length === 1 ? regObj[key] : ('00' + value).substr(('' + value).length)
      })
    }
    return fmt;
  }

  window.Util = Util;
})()