<script>
export default {
  onLaunch: function (option) {
    //console.log("App Launch");
    //----强制更新--------------------------
    const updateManager = uni.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      //console.log("onCheckForUpdate", res.hasUpdate);
      if (res.hasUpdate) {
        uni.showLoading({
          title: "应用更新中"
        });
      }
    });
    updateManager.onUpdateReady(function (res) {
      uni.hideLoading();
      uni.showModal({
        title: "更新提示",
        content: "新版本已经准备好，请重启应用",
        showCancel: false,
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });
    updateManager.onUpdateFailed(function (res) {
      // 新的版本下载失败
      uni.hideLoading();
      uni.showModal({
        title: "温馨提示",
        content: "新版本已经上线，请您删除当前小程序，重新搜索打开",
        showCancel: false
      });
    });
    //------------------
    //console.log("onLaunch:", option);
    if (
      Object.keys(option.referrerInfo).length > 0 &&
      option.referrerInfo.extraData?.appletFrom
    ) {
      //console.log("onLaunch--appletFrom");
    }
  },
  onShow: async function () {
    //console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  }
};
</script>

<style lang="scss">
view,
text {
  line-height: 1;
  font-family: PingFangSC-Regular, PingFang SC;
}

image {
  width: 100%;
  height: auto;
}
</style>
