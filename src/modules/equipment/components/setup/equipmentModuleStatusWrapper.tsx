import { useQuery } from "@tanstack/react-query";
import { Equipment } from "../../interfaces/equipment";
import ListModules from "../../api/module/listModules";
import ModuleStatusElement from "../partial/moduleStatusElement";

export const EquipmentModuleStatusWrapper = ({ equipment }: { equipment: Equipment }) => {
  const moduleQuery = useQuery({
    queryKey: ["module", equipment.id],
    queryFn: () => ListModules({ equipment: equipment }),
  });
  if (moduleQuery.isLoading || moduleQuery.isFetching) {
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

  if (moduleQuery.data == undefined || moduleQuery.data.items.length <= 0) {
    return <></>;
  }

  return (
    <ModuleStatusElement
      module={
        moduleQuery.data.items.find((module) => module.id === equipment.main_tool_module_id) ??
        moduleQuery.data.items[0]
      }
    />
  );
};
