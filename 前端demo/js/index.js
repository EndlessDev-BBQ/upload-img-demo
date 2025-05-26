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
  const reader = new FileReader();
  /* 当图片读取完成会触发这个函数 */
  reader.onload = (e) => {
    doms.img.src = e.target.result;
  };
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
  const url = "http://localhost:9527/upload/single";
  /* 发送请求 */
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  const form = new FormData();
  form.append("avatar", file);
  /* 先设置进度为 0 */
  setProgress(0);
  xhr.upload.onprogress = (e) => {
    setProgress(Math.floor((e.loaded / e.total) * 100));
  };
  xhr.onload = () => {
    const resp = JSON.parse(xhr.responseText);
    showArea("done");
    doms.img.src = `${SERVER_URL}${resp.data}`;
  };
  xhr.send(form);

  // 中断传输
  cancelReq = () => {
    xhr.abort();
    showArea("select");
    doms.img.src = "";
    setProgress(0);
    cancelReq = null;
  };
}

/* 删除按钮 */
doms.delBtn.onclick = () => {
  showArea("select");
  doms.img.src = "";
  setProgress(0);
};
