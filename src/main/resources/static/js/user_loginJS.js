//页面加载时读取cookie值并显示在输入框中
window.addEventListener("load", () => {
  const savedUserName = getCookie("userName");
  const savedPassWord = getCookie("passWord");
  //不为null或者空才填充
  if (savedUserName) {
    document.getElementById("userName").value = savedUserName;
  }
  if (savedPassWord) {
    document.getElementById("passWord").value = savedPassWord;
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
document.getElementById("resetBtn").addEventListener("click", (e) => {
  document.getElementById("passWord").value = "";
});

//错误计数器
let errorCount = 0;
//登录按钮逻辑
document.getElementById("loginBtn").addEventListener("click", (e) => {
  e.preventDefault(); //阻止表单默认提交行为
  //获取表单数据
  const formData = new FormData(document.getElementById("userForm"));
  formData.append("source", "USER_LOGIN"); //添加额外参数，标识请求来源
  formData.append("errorCount", errorCount.toString()); //添加错误计数器参数
  console.log(errorCount.toString());

  //发送ajax请求验证账号密码
  fetch("LoginServlet", {
    method: "POST",
    headers: {
      contentType: "application/x-www-form-urlencoded",
      //不需要设置Content-Type，浏览器会自动设置为 multipart/form-data 并添加边界
    },
    body: formData, //发送表单数据，不需要手动序列化
  })
    .then((response) => response.json()) //期望服务器返回json格式数据，包含了http响应的所有元数据:状态码，头信息等
    .then((data) => {
      //data是response.json()解析后的结果
      if (data.valid) {
        //如果data的valid属性是true
        //验证成功，保存cookie并提交表单
        setCookie("userName", formData.get("userName"), 1);
        document.getElementById("userForm").submit();//提交表单
        alert("登录成功，正在跳转...");
        setTimeout(() => {
          window.location.href = "#"; //跳转
        }, 3000); //3秒跳转
      } else {
        //验证失败，增加错误计数器
        errorCount++;
        if (errorCount >= 3) {
          alert("警告:密码连续3次错误,页面将关闭");
          window.close(); //关闭当前页面
          return;
        }
        alert("用户名或密码错误，请重试！");
        alert(`错误次数: ${errorCount} 次`);
      }
    });
});