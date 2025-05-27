# 上传图片的前端 demo 以及后端 nodejs 服务器 demo

一个上传图片的前端 demo 以及后端 nodejs 服务器 demo 。前端功能：预览上传的图片、进度条实时获取最近上传进度、中断上传。后端功能：提供相应的单文件上传 api 接口，并将上传的图片保存到 uploads 文件夹下、提供可直接访问 uploads 目录下文件的功能。

## 前端实现思路

首先实现的大概效果需要有一个设想。这里做的设计是：选择状态（对应外层容器类名：upload select）、上传进度的状态（对应外层容器类名：upload progress）、最终上传完成后的状态（对应外层容器类名：upload done）。

![前端设计思路](https://img.hoocode.com/i/2025/05/27/ie9vza.webp)

### 难点突破

#### 1. base64 预览图

当用户选择图片后，会触发 input 的 onchange 事件。此时，我们可以拿到选中的文件信息 file 。

为了将图片转换为base64，需要先创建一个 FIleReader 的实例 reader，接着让 reader 读取图片里的信息，当读取完成时会触发 onload 事件，进而通过 e.target.result 来拿到图片的 base64 信息。

```js
...

// 监听选择文件的 onchange 事件
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

...
```

#### 2. 实时展示上传进度

在 XMLHttpRequest 对象里可以使用 `upload.onprogress` 方法拿到实时上传的进度了。

- e.loaded: 已上传的字节数
- e.total: 总的字节数

```js
...
/* 发送请求 */
// 创建一个新的 XMLHttpRequest 对象，用于发送 HTTP 请求
const xhr = new XMLHttpRequest();
// 配置请求：使用 POST 方法，目标 URL 为定义的 url，true 表示异步请求
xhr.open("POST", url, true);

// 创建 FormData 对象，用于构建要发送的表单数据
const form = new FormData();
// 将文件添加到 FormData 对象中，键名为 "avatar"，值为传入的 file
form.append("avatar", file);

// 监听上传进度事件，e 是 ProgressEvent 对象
xhr.upload.onprogress = (e) => {
  // 计算上传进度百分比（已上传字节数 / 总字节数 * 100），并取整
  // 调用 setProgress 函数更新进度显示
  setProgress(Math.floor((e.loaded / e.total) * 100));
};
...
```



## 后端 nodejs 实现思路

首先需要确定监听的端口，这里我就使用9527。其次需要确定提供什么 api 接口给前端使用？用途是什么？接收的限制有哪些？这些都根据接口文档的要求来写。

### 接口文档：单文件上传

请求路径：`/upload/single`

请求方法：`POST`

消息格式：`multipart/form-data`

字段名称：`avatar`

允许的后缀名：`['.jpg', '.jpeg', '.bmp', '.webp', '.gif', '.png']`

最大尺寸：`1M`

响应格式：`JSON`

响应结果示例：

```json
// 成功
{
  "data": "文件的访问地址"
}
// 失败：后缀名不符号要求
{
  "errCode": 1,
  "errMsg": "后缀名不符合要求"
}
// 失败：文件过大
{
  "errCode": 2,
  "errMsg": "文件过大"
}
```

***附加：**

1.  需要提供一个 uploads 文件夹，用来存放上传的图片文件
2.  响应头需要增加一个字段：`Access-Control-Allow-Origin: 页面源`。告诉浏览器开放请求的页面源。这里我开放的是所有源：`*`
3.  需要开放可以直接访问 `/uploads/<filename>` 的权限

## 实现效果

![图片上传效果](https://img.hoocode.com/i/2025/05/27/fn4sb.gif)