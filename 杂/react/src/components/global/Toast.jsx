import ReactDOM from "react-dom";
import { nanoid } from "nanoid";
// import classNames from "classnames";
import styles from "./toast.module.less";
import success from "@/static/img/common/icon-success.png";
import fail from "@/static/img/common/icon-fail .png";

let notice = function (type, content, time) {
  // 弹窗组件
  let Vdom = "";
  if (type === "info") {
    Vdom = <div className={styles.toast}>{content}</div>;
  } else if (type === "success") {
    Vdom = (
      <>
        <img className={styles.icon} src={success} alt="success-icon" />
        <div className={styles.successToast}>{content}</div>
      </>
    );
  } else if (type === "fail") {
    Vdom = (
      <>
        <img className={styles.icon} src={fail} alt="fail-icon" />
        <div className={styles.failToast}>{content}</div>
      </>
    );
  }
  const toastVdom = (
    <div className={styles.container}>
      <div className={styles.main}>{Vdom}</div>
      <div className={styles.bg}></div>
    </div>
  );

  return new Promise((resolve, reject) => {
    let id = "toastModal" + nanoid();
    let toastModal = document.createElement("div");
    toastModal.id = id;
    toastModal.className = "toastModal";
    document.querySelector("#toastWrap").appendChild(toastModal);

    ReactDOM.render(toastVdom, toastModal);
    //ReactDOM.createPortal(toastVdom, document.getElementById("toastWrap"));

    let st = setTimeout(() => {
      ReactDOM.unmountComponentAtNode(toastModal);
      document.querySelector("#toastWrap").removeChild(toastModal);
      // ReactDOM.createPortal("", document.getElementById("toastWrap"));
      clearTimeout(st);
      st = null;
      resolve("ok");
    }, time);
  });
};

const toast = {
  info: (content, time = 2000) => {
    return new Promise(async (resolve, reject) => {
      await notice("info", content, time);
      resolve("ok");
    });
  },
  success: (content, time = 2000) => {
    return new Promise(async (resolve, reject) => {
      await notice("success", content, time);
      resolve("ok");
    });
  },
  fail: (content, time = 2000) => {
    return new Promise(async (resolve, reject) => {
      await notice("fail", content, time);
      resolve("ok");
    });
  }
};
export default toast;
