import React from "react";
import styles from "./index.module.less";
import noData from "@/static/img/noData.png";

export default function index(props) {
  // console.log("noData-com:", props);
  let txt = "未查到匹配的信息";
  if (props.txt) {
    txt = props.txt;
  }

  return (
    <div className={styles.main}>
      <img className={styles.img} src={noData} alt="" />
      <p className={styles.txt}>{txt}</p>
    </div>
  );
}
