import React, { useEffect, useState } from "react";
import styles from "./index.module.less";
import PropTypes from "prop-types";
import classNames from "classnames";
export default function Index(props) {
  const { optionList, defaultVal, clickSubmitBool, handleChangeFn, maxHeight } =
    props;
  // console.log(clickSubmitBool, defaultVal);
  const [showList, setShowList] = useState(false);
  const [defaultTxt, setDefaultTxt] = useState("");
  const handleSelect = (item) => {
    setShowList(false);
    handleChangeFn(item);
  };
  useEffect(() => {
    const obj = optionList.find((item) => item.val === defaultVal);
    setDefaultTxt(obj.txt);
  }, [defaultVal, optionList]);
  return (
    <div
      className={classNames(
        styles.SelectBoxComponent,
        clickSubmitBool && !defaultVal ? styles.SelectBoxWarn : ""
      )}>
      <div className={styles.wrapper} onClick={() => setShowList(!showList)}>
        <span
          className={classNames(
            styles.txt,
            defaultVal ? "" : styles.defaultTxt
          )}>
          {defaultTxt}
        </span>

        <i className={classNames(styles.icon, "iconfont icon-xiala")}></i>
      </div>
      {showList && (
        <div
          className={styles.optionBox}
          style={{ maxHeight: maxHeight + "px" }}>
          <div className={styles.options}>
            {optionList.map((item) => {
              return (
                <div
                  key={item.val}
                  className={styles.optionItem}
                  onClick={() => handleSelect(item)}>
                  {item.txt}
                  {item.val === defaultVal && (
                    <i
                      className={classNames(
                        styles.icon,
                        "iconfont icon-xuanzhonggou1"
                      )}></i>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
Index.propTypes = {
  clickSubmitBool: PropTypes.bool.isRequired,
  optionList: PropTypes.array.isRequired,
  handleChangeFn: PropTypes.func.isRequired,
  //   disabled: PropTypes.string,
  defaultVal: PropTypes.string,
  maxHeight: PropTypes.number
};
Index.defaultProps = {
  clickSubmitBool: false,
  optionList: [],
  //   disabled: "",
  defaultVal: "",
  maxHeight: 360
};
