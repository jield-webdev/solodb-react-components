import React from "react";
import { MonitorRequirementTarget } from "@/modules/monitor/interfaces/requirement/monitorRequirementTarget";
import { MonitorMeasurementResult } from "@/modules/monitor/interfaces/measurement/monitorMeasurementResult";
import { Chart as GoogleChart } from "react-google-charts";

export default function RequirementChart({
  target,
  results,
}: {
  target: MonitorRequirementTarget;
  results: MonitorMeasurementResult[];
}) {
  const options = {
    title: target.logging_parameter.name,
    curveType: "function",
    series: {
      0: { pointSize: 10 },
      1: {},
      2: {},
      3: {},
    },
    legend: { position: "bottom" },
  };

  let data: any = [[{ type: "date", label: "Date" }, "Value"]];

  let seriesIndex: any = 1;

  //We have to dynamically add a series in case we have a target
  if (target.target) {
    data[0].push("Target");
    (options.series as any)[seriesIndex] = {
      color: "#38e22c",
      lineWidth: 2,
      pointShape: { type: "square" },
    };

    seriesIndex++;
  }

  if (target.min_value) {
    data[0].push("Min");
    (options.series as any)[seriesIndex] = {
      color: "#e2431e",
      lineWidth: 2,
      pointShape: { type: "triangle" },
      pointSize: 10,
    };
    seriesIndex++;
  }
  if (target.max_value) {
    data[0].push("Max");
    (options.series as any)[seriesIndex] = {
      color: "#e2431e",
      lineWidth: 2,
      pointShape: { type: "triangle", rotation: 180 },
      pointSize: 10,
    };
  }

  results.forEach((result) => {
    result.values
      .filter((value) => {
        return value.logging_parameter.id === target.logging_parameter.id;
      })
      .filter((value) => {
        return value.float_value !== 0;
      })
      .forEach((value) => {
        let date = new Date(result.date_created);
        data.push([date, value.float_value]);
        if (target.target) {
          data[data.length - 1].push(target.target);
        }
        if (target.min_value) {
          data[data.length - 1].push(target.min_value);
        }
        if (target.max_value) {
          data[data.length - 1].push(target.max_value);
        }
      });
  });

  //If there are no values, add a fake value to show the chart
  if (data.length === 1) {
    return <div className={"text-center"}>No data available</div>;
  }

  return <GoogleChart chartType="ScatterChart" width="100%" height="400px" data={data} options={options} />;
}
