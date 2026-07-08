import { useQuery } from "@tanstack/react-query";
import ModuleStatusElement from "../partial/moduleStatusElement";
import { Equipment, listModules } from "@jield/solodb-typescript-core";

export const EquipmentModuleStatusWrapper = ({ equipment }: { equipment: Equipment }) => {
  const { data: moduleData, isFetching, isLoading } = useQuery({
    queryKey: ["module", equipment.id],
    queryFn: () => listModules({ equipment: equipment }),
  });
  if (isLoading || isFetching) {
    return (
      <div className={"d-flex justify-content-center flex-row align-items-center"}>
        <div className={"d-flex flex-column align-items-center"}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  if (moduleData == undefined || moduleData.items.length <= 0) {
    return <></>;
  }

  return (
    <ModuleStatusElement
      module={
        moduleData.items.find((module) => module.id === equipment.main_tool_module_id) ?? moduleData.items[0]
      }
    />
  );
};
