import React, { useEffect, useState, useRef } from "react";
// import upload from "../../assets/images/upload.png";

export default function FileInput(props) {
  const [fileName, setFileName] = useState("");
  let fileInput = useRef();

  const fileChangeEvent = async (e) => {
    try {
      if (0 < e.target.files.length) {
        setFileName(e.target.files[0].name);
      }
      e.preventDefault();
      props.handleFileUpload("", props.keyItem, e, props.type);
      e.target.value = "";
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {}, [fileName]);

  return (
    <div
      style={{
        ...fiStyle.fiContainer,
        ...(props.borderRadius
          ? { borderRadius: props.borderRadius }
          : { borderRadius: "0.75rem" }),
      }}
    >
      <div style={fiStyle.displayText}>
        {fileName === "" ? (
          <div style={fiStyle.bannerPlaceholder}>Choose A File</div>
        ) : null}
        {fileName !== "" ? (
          <div style={fiStyle.fileToUpload}>{fileName}</div>
        ) : (
          <div style={fiStyle.fileToUpload}>{fileName}</div>
        )}
        <div
          style={{
            ...fiStyle.check,
            ...(fileName !== "" ? { right: "25px" } : { right: "0px" }),
          }}
        >
          {/* <img width="70%" src={upload} /> */}
        </div>
      </div>
      {fileName !== "" ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setFileName("");
            props.deleteValue(props.keyItem);
          }}
          style={fiStyle.removeIcon}
        >
          <div>X</div>
        </div>
      ) : null}
      <input
        type="file"
        name="file"
        ref={(fi) => (fileInput = fi)}
        // style={...fiStyle.input, ...{ width: "90%" }}
        style={{
          ...fiStyle.input,
          ...{ width: fileName !== "" ? "90%" : "100%" },
        }}
        onChange={fileChangeEvent}
        accept={props.allowedExt ? props.allowedExt : "*.*"}
      />
    </div>
  );
}

const fiStyle = {
  fiContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    border: "1px solid #e8e9e9",
    // borderRadius: '0.75rem',
    backgroundColor: "#fff",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  displayText: {
    position: "absolute",
    paddingLeft: "5pt",
    color: "#828282",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  check: {
    position: "absolute",
    height: "100%",
    display: "flex",
    alignItems: "center",
    // right: '0px',
  },
  input: {
    position: "absolute",
    marginTop: "-2rem",
    left: 0,
    // marginLeft: '10px',
    // width: 'calc(20rem - 20px)',
    width: "90%",
    height: "10rem",
    display: "block",
    cursor: "pointer",
    outline: "none",
  },
  fileToUpload: {
    fontWeight: "bold",
    color: "#000",
    // width: '85%',
    width: "75%",
    overflow: "hidden",
    textOverFlow: "ellipses",
    whiteSpace: "nowrap",
  },
  bannerPlaceholder: {
    fontWeight: "bold",
    // width: '85%',
    width: "75%",
    overflow: "hidden",
    textOverflow: "ellipses",
    whiteSpace: "nowrap",
  },
  removeIcon: {
    position: "absolute",
    right: "5px",
    fontSize: "12pt",
    color: "red",
    height: "100%",
    width: "10pt",
    display: "flex",
    alignItems: "center",
  },
};
