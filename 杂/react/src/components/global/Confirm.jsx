import ReactDOM from "react-dom";
import { nanoid } from "nanoid";
import styles from "./confirm.module.less";

let Confirm = (data) => {
  let obj = {
    ...{
      title: "提示",
      content: "",

      okTxt: "确定",
      cancelTxt: "取消",
      callback: () => {}
    },
    ...data
  };
  //---------------------
  let id = "confirmModal" + nanoid();
  let confirmModal = document.createElement("div");
  confirmModal.id = id;
  confirmModal.className = "confirmModal";
  document.querySelector("#confirmWrap").appendChild(confirmModal);

  let cancelFun = () => {
    ReactDOM.unmountComponentAtNode(confirmModal);
    document.querySelector("#confirmWrap").removeChild(confirmModal);
  };
  //-----------------------
  const toastVdom = (
    <div className={styles.confirmModal}>
      <div className={styles.container}>
        <div className={styles.header}>
          {obj.title}
          <i
            className={`${styles.iconClose} iconfont icon-shanchufujian`}
            onClick={cancelFun}></i>
        </div>
        <div className={styles.middle}>
          <i className={`${styles.iconTips} iconfont icon-tishi`}></i>
          <span className={styles.txt}>{obj.content}</span>
        </div>
        <div className={styles.footer}>
          <div
            className={`${styles.okBtn} ${styles.btn}`}
            onClick={() => {
              obj.callback(cancelFun);
            }}>
            {obj.okTxt}
          </div>
          <div
            className={`${styles.cancelBtn} ${styles.btn}`}
            onClick={cancelFun}>
            {obj.cancelTxt}
          </div>
        </div>
      </div>
      <div className={styles.bg}></div>
    </div>
  );

  ReactDOM.render(toastVdom, confirmModal);
  //---------------------------------
};

export default Confirm;
