import React, { useEffect, useState } from "react";
import styles from "./index.module.less";
import PropTypes from "prop-types";
import classNames from "classnames";

export default function Index(props) {
  const {
    defaultVal,
    maxLength,
    type,
    placeholder,
    ruleFn,
    clickSubmitBool,
    handleChangeFn
  } = props;

  const [showWarn, setShowWarn] = useState(false);

  useEffect(() => {
    if (ruleFn) {
      if (clickSubmitBool && !ruleFn(defaultVal)) {
        setShowWarn(true);
      } else {
        setShowWarn(false);
      }
    } else {
      if (clickSubmitBool && !defaultVal) {
        setShowWarn(true);
      } else {
        setShowWarn(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultVal, clickSubmitBool]);

  return (
    <div className={classNames(styles.InputComponent)}>
      <input
        className={classNames(styles.input, showWarn ? styles.inputWarn : "")}
        type={type}
        maxLength={maxLength}
        placeholder={placeholder}
        value={defaultVal}
        onChange={(e) => {
          console.log("input组件:", e.target.value);
          handleChangeFn(e.target.value);
        }}
      />
    </div>
  );
}
Index.propTypes = {
  clickSubmitBool: PropTypes.bool.isRequired,
  handleChangeFn: PropTypes.func.isRequired,
  ruleFn: PropTypes.func,
  //   disabled: PropTypes.string,
  defaultVal: PropTypes.string,
  maxLength: PropTypes.number,
  type: PropTypes.string,
  placeholder: PropTypes.string
};
Index.defaultProps = {
  clickSubmitBool: false,
  optionList: [],
  //   disabled: "",
  defaultVal: "",
  maxLength: 50,
  type: "text",
  placeholder: "请输入"
};
