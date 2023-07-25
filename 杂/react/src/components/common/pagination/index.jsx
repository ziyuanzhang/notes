import React from "react";
import Pagination from "rc-pagination";
import "./index.less";
import "rc-pagination/assets/index.less";

export default function Index(props) {
  let { current, total, pageSize, onChange } = props;
  return (
    <Pagination
      onChange={onChange}
      current={current}
      total={total}
      pageSize={pageSize}
      // showQuickJumper
      showQuickJumper={{ goButton: true }}
      prevIcon={
        <div className="rc-pagination-item leftIcon">
          <i className="iconfont icon-zuola"></i>
        </div>
      }
      nextIcon={
        <div className="rc-pagination-item leftIcon">
          <i className="iconfont icon-youla"></i>
        </div>
      }
    />
  );
}
