//页面加载时读取cookie值并显示在输入框中
window.addEventListener("load", () => {
  const savedUserName = getCookie("username");
  //不为null或者空才填充
  if (savedUserName) {
    document.getElementById("username").value = savedUserName;
  }

});

//返回Cookie
function getCookie(key) {
  const cookieList = document.cookie.split("; ");
  let keyValue;
  for (let i = 0; i < cookieList.length; i++) {
    const arr = cookieList[i].split("=");
    if (key === arr[0].trim()) {
      keyValue = arr[1];
      break;
    }
  }
  return typeof keyValue === "undefined" ? null : keyValue; //返回键值
}
// 删除Cookie
function deleteCookie(key) {
  document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

//设置Cookie
function setCookie(key, value, days = 7) {
  const exp = new Date();
  exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${key}=${encodeURIComponent(
    value
  )};expires=${exp.toUTCString()};path=/`;
}

//重置按钮逻辑
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("password").value = "";
});


//登录按钮逻辑
document.getElementById("loginBtn").addEventListener("click", (e) => {
  e.preventDefault(); //阻止表单默认提交行为
  //获取表单数据
  const loginData = {
    username: document.getElementById("username").value, // 直接拿输入框的值
    password: document.getElementById("password").value,//
  };
  //发送ajax请求验证账号密码
  fetch("/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", //指定请求体的内容类型为JSON字符串
      //不需要设置Content-Type，浏览器会自动设置为 multipart/form-data 并添加边界
    },
    body: JSON.stringify(loginData), //将表单数据作为JSON字符串发送
  })
    .then((response) => response.json()) //期望服务器返回json格式数据，包含了http响应的所有元数据:状态码，头信息等
    .then((data) => {
      //data是response.json()解析后的结果
      if (data.valid) {
        //如果data的valid属性是true
        //验证成功，保存cookie
        setCookie("username", loginData.username, 1);
        alert("登录成功，正在跳转...");
        setTimeout(() => {
          window.location.href = "#"; //跳转
        }, 3000); //3秒跳转
      } else {
        alert("用户名或密码错误，请重试！");
        alert(data.valid);

      }
    });
});