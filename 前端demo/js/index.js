function $(selector) {
  return document.querySelector(selector);
}

const doms = {
  img: $(".preview"),
  container: $(".upload"),
  select: $(".upload-select .icon-jia"),
  selectFile: $(".upload-select input"),
  progressContainer: $(".upload-progress"),
  pp: $(".upload-progress .pp"),
  progNum: $(".upload-progress .pp .num"),
  cancelBtn: $(".cancle-btn"),
  delBtn: $(".upload-done .iconfont"),
};

const SERVER_URL = "http://localhost:9527";

/* 切换显示 */
function showArea(name) {
  doms.container.className = `upload ${name}`;
}

/* 设置进度条 */
function setProgress(progress) {
  doms.progNum.innerText = `${progress}%`;
  doms.pp.style.setProperty("--percent", progress);
}

/* 选择文件 */
doms.select.onclick = () => {
  doms.selectFile.click();
};

/* 选择文件过后 input 触发的更改事件 */
doms.selectFile.onchange = (e) => {
  /* 拿到所上传的图片 */
  const file = e.target.files[0];
  /* 切换显示的页面 */
  showArea("progress");
  /* 将图片转换为 base64 并替换到 img 里作为预览 */
  // 创建一个 FileReader 实例，用于读取文件内容
  const reader = new FileReader();

  /* 当图片读取完成会触发这个函数 */
  // 为 reader 的 onload 事件绑定一个回调函数，e 是事件对象
  reader.onload = (e) => {
    // 将 img 元素的 src 属性设置为读取到的 base64 数据（e.target.result 包含文件的 base64 编码）
    doms.img.src = e.target.result; // 这里的 result 就是图片的 base64 地址
  };

  // 调用 readAsDataURL 方法，读取文件并将其转换为 base64 格式的数据
  reader.readAsDataURL(file); // 读取图片
  upload(file); // 调用上传图片方法
};

let cancelReq = null; // 中断传输

/* 点击取消按钮 */
doms.cancelBtn.onclick = () => {
  cancelReq && cancelReq();
};

/* 上传文件，同时监听上传进度 */
function upload(file) {
  // 定义上传文件的接口地址
  const url = "http://localhost:9527/upload/single";

  /* 发送请求 */
  // 创建一个新的 XMLHttpRequest 对象，用于发送 HTTP 请求
  const xhr = new XMLHttpRequest();

  // 配置请求：使用 POST 方法，目标 URL 为定义的 url，true 表示异步请求
  xhr.open("POST", url, true);

  // 创建 FormData 对象，用于构建要发送的表单数据
  const form = new FormData();

  // 将文件添加到 FormData 对象中，键名为 "avatar"，值为传入的 file
  form.append("avatar", file);

  /* 先设置进度为 0 */
  // 初始化上传进度为 0（假设 setProgress 是一个更新 UI 进度的函数）
  setProgress(0);

  // 监听上传进度事件，e 是 ProgressEvent 对象
  xhr.upload.onprogress = (e) => {
    // 计算上传进度百分比（已上传字节数 / 总字节数 * 100），并取整
    // 调用 setProgress 函数更新进度显示
    setProgress(Math.floor((e.loaded / e.total) * 100));
  };

  // 监听请求完成事件（当请求完成且响应返回时触发）
  xhr.onload = () => {
    // 解析服务器返回的 JSON 响应数据
    const resp = JSON.parse(xhr.responseText);

    // 调用 showArea 函数，切换 UI 显示到 "done" 状态（假设是显示上传完成）
    showArea("done");

    // 设置图片元素的 src 属性为服务器返回的文件 URL（SERVER_URL 是全局变量）
    doms.img.src = `${SERVER_URL}${resp.data}`;
  };

  // 发送 FormData 数据到服务器，开始上传
  xhr.send(form);

  // 定义 cancelReq 函数，用于中断上传
  cancelReq = () => {
    // 调用 xhr.abort() 中止当前的上传请求
    xhr.abort();

    // 调用 showArea 函数，切换 UI 显示到 "select" 状态（假设是回到文件选择界面）
    showArea("select");

    // 清空图片元素的 src 属性
    doms.img.src = "";

    // 重置上传进度为 0
    setProgress(0);

    // 将 cancelReq 设置为 null，避免重复调用
    cancelReq = null;
  };
}

/* 删除按钮 */
doms.delBtn.onclick = () => {
  showArea("select");
  doms.img.src = "";
  setProgress(0);
};
