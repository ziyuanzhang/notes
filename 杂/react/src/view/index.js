import React, { useState, useEffect } from "react";
import styles from "./index.module.less";
import classNames from "classnames";

import SelectBox from "@/components/common/SelectBox/index";
import Input from "@/components/common/Input/index";
import Upload from "@/components/common/Upload/index";
import SelectMultiple from "@/components/common/SelectMultiple/index";

const sexList = [
  { val: "", txt: "请选择" },
  { val: "0", txt: "女" },
  { val: "1", txt: "男" }
];
const blackKeywordList = [
  { val: "", txt: "请选择" },
  { val: "法律法规", txt: "法律法规" },
  { val: "职业信用", txt: "职业信用" },
  { val: "职业操守及道德品质", txt: "职业操守及道德品质" }
];
export default function Index(props) {
  const [showClickUpload, setShowClickUpload] = useState(false); // 判断是否点击过上传

  //--------------------------
  const [name, setName] = useState(""); // 姓名
  const [sex, setSex] = useState(""); // 性别
  const [dataList, setDataList] = useState([]); // 禁招禁用类别
  const [fileName, setFileName] = useState(""); // 附件名称
  const [fileUrl, setFileUrl] = useState(""); // 附件路径
  //===============================================
  const [batchFileName, setBatchFileName] = useState(""); // 批量上传文件名称
  //===========================================

  return (
    <div className={styles.popUp}>
      <div>
        <div className={styles.row}>
          <div className={styles.item}>
            <span className={styles.label}>姓名</span>
            <div className={styles.inputWrapper}>
              <Input
                defaultVal={name}
                clickSubmitBool={showClickUpload}
                handleChangeFn={(val) => {
                  setName(val);
                }}></Input>
            </div>
          </div>
          <div className={styles.item}>
            <span className={classNames(styles.label, styles.txtRight)}>
              性别
            </span>
            <div className={styles.SelectBoxWrapper}>
              <SelectBox
                className="select"
                clickSubmitBool={showClickUpload}
                defaultVal={sex}
                optionList={sexList}
                handleChangeFn={(obj) => {
                  // console.log("性别:", obj);
                  setSex(obj.val);
                }}></SelectBox>
            </div>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.item}>
            <span className={classNames(styles.label, styles.flexStart)}>
              禁招禁用类别
            </span>
            <div className={styles.SelectBoxWrapper}>
              <SelectMultiple
                clickSubmitBool={showClickUpload}
                defaultVal={dataList}
                optionList={blackKeywordList}
                handleChangeFn={(arr) => {
                  //  console.log("禁招禁用类别:", arr);
                  setDataList(arr);
                }}></SelectMultiple>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.item}>
            <span className={styles.label}>附件(选填)</span>
            <div className={styles.UploadWrapper}>
              <Upload
                accept=".doc,.docx,.pdf,.rar,.jpg,.png,.xls,.xlsx"
                tips="doc,docx,pdf,rar,jpg,xls,xlsx等,最大支持10M"
                defaultFile={{ fileName, fileUrl }}
                uploadFileFn={uploadFile}
                handleChangeFn={(obj) => {
                  // console.log("附件(选填):", obj);
                  setFileName(obj.name);
                  setFileUrl(obj.path);
                }}></Upload>
            </div>
          </div>
          <div className={styles.UploadWrapper}>
            <Upload
              accept=".xls,.xlsx"
              tips="请先下载相应模版，完成表格中必填项填写后，再点击上传附件。<br/> 我们将严格保密您的相关信息，不对外公开展示。"
              defaultFile={{ fileName: batchFileName, fileUrl: "" }}
              handleChangeFn={(obj) => {
                // console.log("批量上传:", obj);
                setBatchFileName(obj.name);
                setBatchFile(obj);
              }}></Upload>
          </div>
        </div>
      </div>
      <div className={styles.btnList}>
        <div
          className={classNames(styles.btn, styles.cancel)}
          onClick={() => {}}>
          取消
        </div>
        <div
          className={classNames(styles.btn, styles.ok)}
          onClick={setShowClickUpload(true)}>
          上传
        </div>
      </div>
    </div>
  );
}
