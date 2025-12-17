import axios from "axios";
import { useState } from "react";
import { RunStepParameter, StepParameterValue } from "solodb-typescript-core";

export const RunStepParameterEditButton = ({ parameter, value, refetchFn }: {parameter: RunStepParameter; value: StepParameterValue; refetchFn: () => void }) => {
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(value.value);

  const editValue = async (newValue: string) => {
    const payload: any = {
      value: newValue,
    };

    try {
      if (value.id !== undefined) {
            await axios.patch(`/update/run/step/parameter/value/${value.id}`, payload);
      } else {
            payload.parameter = parameter.id;
            await axios.post(`/create/run/step/parameter/value`, payload);
      }
    } catch (e) {
      console.error("Failed to update parameter value with error: ", e);
    }

    refetchFn();
    setShowEdit(false);
  };

  return (
    <>
      <span
        style={{
          cursor: "pointer",
          borderBottom: "1px dashed #999",
          display: showEdit ? "none" : "",
        }}
        className={value.value == "" || value.value == null ? "text-muted" : ""}
        onClick={() => {
          setShowEdit(!showEdit);
        }}
      >
        {value.value !== "" && value.value !== null ? value.value : "edit"}
      </span>
      <div style={{ display: showEdit ? "" : "none" }} className="btn-group">
        <input
          type="text"
          value={inputValue ?? ""}
          className="form-control"
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          onClick={() => {
            editValue(inputValue);
          }}
          className="btn btn-success btn-sm"
        >
          <i className="fa fa-check"></i>
        </button>
        <button
          onClick={() => {
            setShowEdit(false);
          }}
          className="btn btn-danger btn-sm"
        >
          <i className="fa fa-times"></i>
        </button>
      </div>
    </>
  );
};
