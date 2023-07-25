import React from "react";
import styles from "./index.module.less";
import PropTypes from "prop-types";
import classNames from "classnames";
export default function Index(props) {
  const { handleChangeFn, accept, tips, maxSize, uploadFileFn, defaultFile } =
    props;
  // const [file, setFile] = useState({ name: "", path: "" });
  const inputRef = React.createRef();
  const handleChange = async (e) => {
    // console.log("文件上传:", e.target.files);

    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size < 1024 * 1024 * maxSize) {
        if (uploadFileFn) {
          let formData = new FormData();
          formData.append("file", file);
          let resCode = await uploadFileFn(formData);
          if (resCode.code === "success") {
            // setFile(file.name);
            handleChangeFn({
              name: resCode.data.fileName,
              path: resCode.data.fileURL
            });
          } else {
            window.$Toast.fail(`上传失败！`);
          }
        } else {
          // setFile(file);
          handleChangeFn(file);
        }
      } else {
        window.$Toast.fail(`文件大小不能超过${maxSize}M!`);
      }
    }
  };
  const handleDownload = () => {
    //查看 上传的图片或文档
    if (defaultFile.fileUrl) {
      window.open(
        `${process.env.REACT_APP_file_URL}${defaultFile.fileUrl}`,
        "_blank"
      );
    }
  };
  return (
    <div className={styles.uploadComponent}>
      <div className={styles.main}>
        <span className={styles.txt} onClick={handleDownload}>
          {defaultFile.fileName}
        </span>
        <span className={styles.divider}></span>
        <span className={styles.btn}>
          <i
            className={classNames(
              styles.icon,
              "iconfont icon-a-shangchuanbeifen4"
            )}></i>
          上传文件
        </span>
        <input
          type="file"
          className={styles.input}
          accept={accept}
          ref={inputRef}
          onClick={() => {
            inputRef.current.value = null;
          }}
          onChange={(e) => {
            handleChange(e);
          }}
        />
      </div>
      {tips && (
        <div className={styles.tips}>
          <span className={styles.icon}></span>
          <span
            className={styles.txt}
            dangerouslySetInnerHTML={{ __html: tips }}></span>
        </div>
      )}
    </div>
  );
}
Index.propTypes = {
  handleChangeFn: PropTypes.func.isRequired,
  defaultFile: PropTypes.object.isRequired,
  accept: PropTypes.string.isRequired,
  maxSize: PropTypes.number,
  tips: PropTypes.string,
  uploadFileFn: PropTypes.func
};
Index.defaultProps = {
  maxSize: 10, //M
  tips: ""
};
