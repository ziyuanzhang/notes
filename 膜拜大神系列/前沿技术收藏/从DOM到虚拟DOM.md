## 从 DOM 到虚拟 DOM——前端 DOM 发展史、性能与产能双赢背后的思考

切图仔 --> JQuery --> 模板语法 -->虚拟 DOM

1. 静态页面与切图——低需求下的低要求
2. JQ 时代——日益增长的需求与低下开发效率的矛盾
3. 后 JQ 时代——进一步提升效率的模板语法
4. 三大框架时代——虚拟 DOM 的狂飙

**模板语法的流程：** 数据--> 模板 -->真实 dom；  
**虚拟 DOM 的流程：** 数据--> 模版/算法/语法糖 --> 虚拟 dom --> 一系列 js 操作 --> 真实 dom；  
虚拟 DOM 是作为数据和真实 DOM 之间的缓冲层诞生的；

**虚拟 DOM 具有：**

1. 差量更新（diff 算法）
2. 批量更新（用户在短时间内对 dom 进行高频操作时，取最后一次的操作结果）

#### 模板语法 VS 虚拟 DOM

- 在数据量少的情况下，两者性能相差无几。
- 数据量多的情况下，若是数据改变大，接近于全页面更新，模版语法性能更好。
- 在局部更新为主的环境下，虚拟 DOM 的性能更好

[原文](https://mp.weixin.qq.com/s?__biz=MzA4Nzg0MDM5Nw==&mid=2247488915&idx=2&sn=136dc3384465d1145a9af87d051a9709&chksm=90321671a7459f673f2ea529813314f5bca99dfb5c344e89ff91b42e31927f32d44e96752e6d&scene=126&sessionid=1607303122&key=83b7fdc2e28db965f30e89af83e4d0c1f452c25f08d57c9ce025f5db060139c0b3d449736faf33e3327a14e097830fe4b1538ae2427218bb822a9555551078b6ac96d1d5da0dd1d5e7a9ce248df2c8186be408bff4efdb1f50b84c464a8eeef4a3db860ea2f7451917b0d89c7d9220866e86dadf7808d0e8002a0d2922787d07&ascene=1&uin=MjIxMTY3MjYxOA%3D%3D&devicetype=Windows+10+x64&version=63000039&lang=zh_CN&exportkey=A9uXaDCVprX9Ye%2BmL2k2n4M%3D&pass_ticket=F7vAYgFE7u9qr4B4Pgv9p7g8pE5zQGLwmCQl5CL4x%2BX0GFeg%2BNJP3PKI1I2tZDVd&wx_header=0)
