import React, { useState, useEffect } from "react";
import styles from "./index.module.less";
import PropTypes from "prop-types";
import classNames from "classnames";

export default function Index(props) {
  const { optionList, defaultVal, clickSubmitBool, handleChangeFn, maxHeight } =
    props;

  const [showList, setShowList] = useState(false);

  const handleChange = (obj) => {
    //  console.log("SelectMultiple:", obj);
    if (!obj.val) {
      setShowList(false);
      handleChangeFn([]);
    } else {
      // console.log("多选:", defaultVal);
      let arr = [...defaultVal];
      if (arr.indexOf(obj.val) > -1) {
        arr = arr.filter((item) => {
          return item !== obj.val;
        });
      } else {
        arr.push(obj.val);
      }
      handleChangeFn(arr);
    }
  };
  useEffect(() => {
    document.addEventListener("click", (e) => {
      const SelectMultipleComponent = document.querySelector(
        ".SelectMultipleComponent"
      );
      if (
        !!SelectMultipleComponent &&
        !SelectMultipleComponent.contains(e.target)
      ) {
        setShowList(false);
      }
    });
    return () => {
      document.removeEventListener("click", function () {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className={classNames(
        "SelectMultipleComponent",
        styles.SelectMultipleComponent,
        clickSubmitBool && defaultVal.length === 0
          ? styles.SelectMultipleWarn
          : ""
      )}>
      <div
        className={styles.selectTTT}
        onClick={() => {
          setShowList(!showList);
        }}>
        {defaultVal.length === 0 && (
          <div className={styles.tipsWrapper}>
            <span className={styles.tips}>请选择(可多选)</span>
            <i className={classNames(styles.icon, "iconfont icon-xiala")}></i>
          </div>
        )}
        {defaultVal.map((item, index) => {
          return (
            <span key={index} className={styles.selectedItems}>
              {item}
            </span>
          );
        })}
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
                  onClick={() => handleChange(item)}>
                  {item.txt}
                  {defaultVal.indexOf(item.val) >= 0 && (
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
  defaultVal: PropTypes.array,
  maxHeight: PropTypes.number
};
Index.defaultProps = {
  clickSubmitBool: false,
  optionList: [],
  //   disabled: "",
  defaultVal: [],
  maxHeight: 360
};
