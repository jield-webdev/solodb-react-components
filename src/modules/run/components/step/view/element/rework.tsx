import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { RunStep } from "@/modules/run/interfaces/runStep";
import { TemplateStep as TemplateStep } from "@/modules/template/interfaces/templateStep";
import { useQueries } from "@tanstack/react-query";
import ListTemplates from "@/modules/template/api/listTemplates";
import { Template } from "@/modules/template/interfaces/template";
import ListRunSteps from "@/modules/run/api/listRunSteps";
import getTemplateSteps from "@/modules/template/api/getTemplateSteps";
import { Recipe } from "@/modules/process/interfaces/module/recipe";
import axios from "axios";
import { RunStepContext } from "@/modules/run/contexts/runStepContext";

const Rework = () => {
  const { runStep, run } = useContext(RunStepContext);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [reworkTemplate, setReworkTemplate] = useState<Template | null>(null);
  const [reworkSteps, setReworkSteps] = useState<number[]>([]);
  const [templateSteps, setTemplateSteps] = useState<number[]>([]);
  const [reworkRecipes, setReworkRecipes] = useState<Recipe[]>([]);
  const [comment, setComment] = useState<string>("");
  const [isCreatingRework, setIsCreatingRework] = useState<boolean>(false);

  if (!runStep.has_recipe) {
    return "Reworks are only possible for steps with a recipe";
  }

  //We need to find the templates and the corresponding run step groups
  const [templateQuery, runStepQuery, templateStepQuery] = useQueries({
    queries: [
      {
        queryKey: ["templates", reworkRecipes],
        queryFn: () => ListTemplates({ reworkRecipes: reworkRecipes }),
        enabled: showForm && reworkRecipes.length > 0,
      },
      {
        queryKey: ["run_steps", runStep.id],
        queryFn: () => ListRunSteps({ run: run, page: 1, pageSize: 1000 }),
        enabled: showForm,
      },
      {
        queryKey: ["template_steps", "rework", reworkTemplate, runStep.id],
        queryFn: () =>
          getTemplateSteps({
            template: reworkTemplate!,
            pageSize: 1000,
          }),
        enabled: reworkTemplate !== null,
      },
    ],
  });

  //We can grab the templates based on the recipes coming from the selected rework steps
  //Therefore we save all selected rework recipes in the state
  //This has to be wrapped in a useEffect hook
  useEffect(() => {
    if (runStepQuery.isSuccess && reworkSteps.length > 0) {
      let recipes = runStepQuery
        .data!.items.filter((step: RunStep) => reworkSteps.includes(step.id))
        .map((step: RunStep) => step.recipe_version!.recipe);
      setReworkRecipes([...recipes]);
    }
  }, [runStepQuery.isSuccess, reworkSteps]);

  function selectReworkTemplate(templateId: number) {
    //Go over the list of templates and select the one that matches the templateId
    let template = templateQuery.data!.templates.find((template: Template) => template.id === templateId);
    //Save this in the state
    if (template !== undefined) {
      setReworkTemplate(template);
    }
  }

  function createRework() {
    let errors: Record<string, string> = {};

    setFormErrors({});

    if (reworkSteps.length === 0) {
      errors["runStep"] = "Please select at least one step";
    }

    //Set the errors in the form Errors state
    setFormErrors((formErrors) => ({ ...formErrors, ...errors }));

    if (Object.keys(errors).length === 0) {
      setIsCreatingRework(true);
      //Do a post request to the backend to create the rework
      axios
        .create()
        .patch("/update/run/step/rework/" + runStep.id, {
          reworked_run_steps: reworkSteps,
          template_steps: templateSteps,
          comment: comment,
        })
        .then(() => {
          //Refresh the page
          setIsCreatingRework(false);
          window.location.reload();
        });
    }
  }

  return (
    <>
      {/*Do not create a function here, otherwise the form loses focus after typing 1 element*/}
      {showForm && (
        <Form method={"post"} onSubmit={() => createRework()}>
          <div className={"row mb-3"}>
            <Form.Label className={"col-sm-3 col-form-label text-end"}>Template</Form.Label>
            <div className={"col-sm-9"}>
              {reworkRecipes.length === 0 && <Alert variant={"info"}>Please select a rework step</Alert>}

              {reworkRecipes.length > 0 && (
                <Form.Control
                  as={"select"}
                  name="template"
                  onChange={(e) => selectReworkTemplate(parseInt(e.target.value))}
                  isInvalid={!!formErrors["template"]}
                >
                  <option value={""}>— Select a template</option>
                  {templateQuery.data !== undefined &&
                    templateQuery.data.templates.map((template: Template, i: React.Key) => {
                      return (
                        <option key={i} value={template.id}>
                          {template.label}: {template.name}
                        </option>
                      );
                    })}
                </Form.Control>
              )}

              {formErrors["template"] && <span className={"text-danger"}>{formErrors["template"]}</span>}
            </div>
          </div>

          {reworkTemplate !== null && (
            <div className={"row mb-3"}>
              <Form.Label className={"col-sm-3 col-form-label text-end"}>Include template steps</Form.Label>
              <div className={"col-sm-9"}>
                <ul className={"list-group"}>
                  {!templateStepQuery.isLoading &&
                    templateStepQuery.data !== undefined &&
                    templateStepQuery.data.steps.map((step: TemplateStep, i: React.Key) => {
                      //Stop the loop when the current step has been reached
                      return (
                        <li key={i} className={"list-group-item "}>
                          <div className={"form-check"}>
                            <input
                              type="checkbox"
                              className={"form-check-input"}
                              id={"templateStep" + step.id}
                              name="templateStep"
                              onChange={(e) => {
                                //Add all selected steps to the state
                                if (e.target.checked) {
                                  setTemplateSteps([...templateSteps, step.id]);
                                } else {
                                  //Remove the step from the state
                                  setTemplateSteps(templateSteps.filter((value) => value !== step.id));
                                }
                              }}
                              value={step.id}
                            />
                            <label htmlFor={"templateStep" + step.id} className={"from-check-label"}>
                              <small className={"text-muted pe-2"}>{step.number}:</small>
                              {step.process_module.process.name}
                            </label>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          )}

          <div className={"row mb-3"}>
            <Form.Label className={"col-sm-3 col-form-label text-end"}>Repeat steps</Form.Label>
            <div className={"col-sm-9"}>
              <ul className={"list-group"}>
                {runStepQuery.isLoading && <option>Loading run steps...</option>}
                {!runStepQuery.isLoading &&
                  runStepQuery.data!.items.map((step: RunStep, i: React.Key) => {
                    //Stop the loop when the current step has been reached
                    if (runStep.sequence >= step.sequence) {
                      return (
                        <li
                          key={i}
                          className={
                            "list-group-item d-flex justify-content-between" +
                            (runStep.id === step.id ? " bg-success-subtle" : "")
                          }
                        >
                          <div className={"form-check"}>
                            <input
                              type="checkbox"
                              className={"form-check-input"}
                              id={"runStep" + step.id}
                              name="runStep"
                              onChange={(e) => {
                                //Add all selected steps to the state
                                if (e.target.checked) {
                                  setReworkSteps([...reworkSteps, step.id]);
                                } else {
                                  //Remove the step from the state
                                  setReworkSteps(reworkSteps.filter((value) => value !== step.id));
                                }
                              }}
                              value={step.id}
                            />
                            <label htmlFor={"runStep" + step.id} className={"from-check-label"}>
                              <small className={"text-muted pe-2"}>{step.number}:</small>
                              {step.process_module.process.name}
                            </label>
                          </div>

                          {step.is_finished && (
                            <div>
                              <span className={"badge bg-success"}>Finished</span>
                            </div>
                          )}
                        </li>
                      );
                    }
                  })}
              </ul>

              {formErrors["runStep"] && <span className={"text-danger"}>{formErrors["runStep"]}</span>}
            </div>
          </div>

          <div className={"row mb-3"}>
            <Form.Label className={"col-sm-3 col-form-label text-end"}>Comment</Form.Label>
            <div className={"col-sm-9"}>
              <Form.Group controlId="runStep.remark">
                <Form.Control
                  as="textarea"
                  rows={6}
                  onChange={(e) => setComment(e.target.value)}
                  value={comment}
                  isInvalid={!!formErrors["comment"]}
                />
                <small className={"text-muted"}>Optional comment for the rework</small>
              </Form.Group>
            </div>
          </div>

          <div className={"row mb-3"}>
            <div className={"col-sm-9 offset-sm-3"}>
              <Button variant="primary" onClick={() => createRework()} disabled={isCreatingRework}>
                {isCreatingRework && <span className="spinner-border spinner-border-sm me-1"></span>}
                Create rework
              </Button>
              &nbsp;
              <Button variant="warning" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Form>
      )}

      {!showForm && (
        <Button variant={"primary"} className={"mt-3"} onClick={() => setShowForm(true)}>
          Set Rework
        </Button>
      )}
    </>
  );
};

export default Rework;
