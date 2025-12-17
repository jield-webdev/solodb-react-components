import axios from "axios";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { Requirement, MeasurementResult, RunPart, RunStepPart } from "solodb-typescript-core";

export const FillValueModal = ({
  requirement,
  result,
  show,
  setShow,
  refetchFn,
  part,
  stepPart,
}: {
  requirement: Requirement;
  result?: MeasurementResult;
  show: boolean;
  setShow: (set: boolean) => void;
  refetchFn: (keys: any) => void;
  part?: RunPart;
  stepPart?: RunStepPart;
}) => {
  const [valuesDictionary, setValuesDictionary] = useState<{ [loggingParameter: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // initialize the values dictionary
  useEffect(() => {
    if (Object.keys(valuesDictionary).length > 0) {
      return;
    }

    let newValuesDictionary: { [loggingParameter: number]: string } = {};
    for (const target of requirement.targets) {
      let value = "";
      if (result !== undefined) {
        value = result.values.find((v) => v.logging_parameter.id == target.logging_parameter.id)?.string_value ?? "";
      }
      newValuesDictionary[target.logging_parameter.id] = value;
    }

    setValuesDictionary(newValuesDictionary);
  }, [requirement]);

  useEffect(() => {
    setSuccess(false);
    setError(null);
    setLoading(false);
  }, [show]);

  const deleteFn = async () => {
    try {
      setError(null);
      setSuccess(false);
      setLoading(true);

      await axios.delete(`/delete/run/measurement/result/${result?.id ?? 0}`);

      setSuccess(true);
      refetchFn(["requirement", "measurementResults", JSON.stringify(requirement.measurement.id)]);
    } catch (e) {
      console.error(e);
      setError("Update of results failed");
    } finally {
      setLoading(false);
    }
  };

  const patchFn = async () => {
    try {
      setError(null);
      setSuccess(false);
      setLoading(true);

      const patchPromises = Object.entries(valuesDictionary).map(async ([key, value]) => {
        const loggingParameter = Number.parseInt(key);
        const patchBody = { value };

        const valueId = result?.values.find((v) => v.logging_parameter.id === loggingParameter)?.id;

        await axios.patch(`/update/run/measurement/result/value/${valueId ?? 0}`, patchBody);
      });

      await Promise.all(patchPromises);

      setSuccess(true);
      refetchFn(["requirement", "measurementResults", JSON.stringify(requirement.measurement.id)]);
    } catch (e) {
      console.error(e);
      setError("Update of results failed");
    } finally {
      setLoading(false);
    }
  };

  const postFn = async () => {
    const postBody: any = {
      measurement: requirement.measurement.id,
      values: Object.entries(valuesDictionary).flatMap((entry) => {
        return { logging_parameter: Number.parseInt(entry[0]), value: entry[1] };
      }),
    };

    if (stepPart) {
      postBody.step_part = stepPart?.id ?? 0;
      postBody.part = part?.id ?? 0;
      postBody.step = requirement.step.id ?? 0;
    }

    try {
      setError(null);
      setSuccess(false);
      setLoading(true);

      await axios.post(`/create/run/measurement/result`, postBody);

      setSuccess(true);
      refetchFn(["requirement", "measurementResults", JSON.stringify(requirement.measurement.id)]);
    } catch (e) {
      console.error(e);
      setError("Update of results failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) {
      postFn();
    } else {
      patchFn();
    }
  };

  return (
    <Modal show={show} size="lg" onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>{result ? <>Update results</> : <>Create result</>}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Results have been updated successfully</Alert>}

          {requirement.targets.map((target) => {
            const value = result?.values.find(
              (v) => v.logging_parameter.id === target.logging_parameter.id
            )?.string_value;
            return (
              <Form.Group key={target.id} className="mb-3">
                <Form.Label>{target.logging_parameter.name}</Form.Label>
                <Form.Control
                  type="number"
                  step="any"
                  placeholder="Thickness"
                  value={valuesDictionary[target.logging_parameter.id] ?? ""}
                  onChange={(e) =>
                    setValuesDictionary((old) => ({
                      ...old,
                      [target.logging_parameter.id]: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            );
          })}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="warning" onClick={() => setShow(false)}>
            Close
          </Button>
          {loading ? (
            <Button type="submit" variant="info" disabled={loading}>
              <Spinner animation="border" size="sm" className="me-2" /> Updating results...
            </Button>
          ) : result ? (
            <>
              <Button variant="danger" disabled={loading} onClick={deleteFn}>
                Delete result
              </Button>

              <Button type="submit" variant="info" disabled={loading}>
                Update result
              </Button>
            </>
          ) : (
            <Button type="submit" variant="info" disabled={loading}>
              Create result
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
