import React from "react";
import styles from "./loading.module.less";
import loading from "@/static/img/common/loading.gif";

export default function Loading() {
  return (
    <div className={styles.loadModal}>
      <img src={loading} className={styles.img} alt="loading" />
      <div className={styles.bg}></div>
    </div>
  );
}
