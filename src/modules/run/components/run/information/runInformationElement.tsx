import RunInformationGrid from "@jield/solodb-react-components/modules/run/components/run/information/elements/runInformationGrid";
import RunUploadFiles from "@jield/solodb-react-components/modules/run/components/run/information/elements/runUploadFiles";

export default function RunInformationElement() {
  return (
    <div>
      <h2>Run information</h2>
      <RunInformationGrid />
      <RunUploadFiles />
    </div>
  );
}
