import { Button, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import EditSortingPropertiesModal from "./editSortingPropertiesModal";
import { Equipment, EquipmentGrade, FilterData } from "@jield/solodb-typescript-core";

export default function EquipmentTable({
  equipmentList,
  currentFilter,
  setEquipmentSort,
  addEquipment,
  addDisabled = false,
}: {
  equipmentList: Equipment[];
  currentFilter: FilterData | undefined;
  addEquipment: (equipment: Equipment) => void;
  addDisabled?: boolean;
  setEquipmentSort: Dispatch<
    SetStateAction<{
      order: string;
      direction?: "asc" | "desc";
    }>
  >;
}) {
  const { environment } = useParams();

  const isReserved = (equipment: Equipment): boolean => {
    return equipment.main_tool_latest_status?.status.status === "RESERVED";
  };

  const [blacklistedEquipmentProperties, setBlacklistedEquipmentProperties] = useState<string[]>([]);
  const [showEditSortingPropertiesModal, setShowEditSortingPropertiesModal] = useState<boolean>(false);

  const showEquipmentProperties = useMemo(() => {
    const hasTypeFilter = (currentFilter?.facet.type_name?.values?.length ?? 0) > 0;
    const hasCategoryFilter = (currentFilter?.facet.category?.values?.length ?? 0) > 0;
    return hasTypeFilter || hasCategoryFilter;
  }, [currentFilter]);

  const properties = useMemo(() => {
    return Array.from(
      new Map(
        equipmentList
          .flatMap((eq) =>
            (eq.properties ?? []).map((prop) => ({
              property: prop.property,
              label: prop.label,
              type: prop.int_value != null ? "int" : prop.float_value != null ? "float" : "string",
            }))
          )
          .map((p) => [p.property, p])
      )
        .values()
        .filter((prop) => !blacklistedEquipmentProperties.includes(prop.property))
    );
  }, [equipmentList, blacklistedEquipmentProperties]);

  /*
   * TanStack Table
   */
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Keep external sort in sync with TanStack sorting
  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting((prev) => {
        const next = typeof updater === "function" ? (updater as any)(prev) : updater;

        // Mirror the first sort rule to your external state
        if (!next.length) {
          // no sorting
          setEquipmentSort((prevExt) => ({
            ...prevExt,
            direction: undefined,
          }));
        } else {
          const { id, desc } = next[0];
          setEquipmentSort({
            order: id,
            direction: desc ? "desc" : "asc",
          });
        }

        return next;
      });
    },
    [setEquipmentSort]
  );

  const columns = React.useMemo<ColumnDef<Equipment>[]>(() => {
    const baseColumns: ColumnDef<Equipment>[] = [
      {
        accessorKey: "number",
        cell: (info) => info.getValue(),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const equipment = row.original;
          const reserved = isReserved(equipment);

          return (
            <>
              {reserved && <span className="badge bg-info badge-inactive">RESERVED</span>}{" "}
              {equipment.is_in_fixed_setup && (
                <span className="badge bg-info badge-inactive">In Fixed setup {equipment.fixed_setup?.name}</span>
              )}{" "}
              {equipment.is_in_active_setup && !equipment.is_in_fixed_setup && (
                <span className="badge bg-info badge-active">In use in {equipment.active_setup?.name}</span>
              )}{" "}
              {!equipment.is_in_fixed_setup && (
                <button
                  onClick={() => addEquipment(equipment)}
                  className="btn btn-outline-success btn-sm"
                  disabled={addDisabled}
                  title={addDisabled ? "Setup is still loading" : undefined}
                >
                  <i className="fa fa-plus" /> Add to setup
                </button>
              )}
            </>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const s = row.original.main_tool_latest_status?.status;
          if (!s) return null;
          return (
            <div className="badge" style={{ color: s.front_color, backgroundColor: s.back_color }}>
              {s.status}
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row, getValue }) => {
          const equipment = row.original;
          const inactive = !equipment.active;
          return (
            <>
              <a href={`/${environment}/equipment/details/${row.original.id}/general.html`}>
                {String(getValue() ?? "")}
              </a>{" "}
              <a href={`/${environment}/equipment/edit/${row.original.id}.html`}>
                <i className="fa fa-pencil-square-o fa-fw" />
              </a>
              {inactive && <span className="badge bg-danger">INACTIVE</span>}{" "}
            </>
          );
        },
      },
    ];
    const nonPropertiesColumns: ColumnDef<Equipment>[] = [
      {
        header: "Types",
        accessorFn: (row) => row.types?.join(", ") ?? "",
        id: "types",
        cell: ({ getValue }) => <>{String(getValue() ?? "")}</>,
      },

      {
        header: "Grade",
        accessorFn: (row) => row.grade,
        id: "grade",
        cell: ({ getValue }) => (
          <>
            {parseInt(getValue() as string) === EquipmentGrade.Equipment ? "Equipment" : null}
            {parseInt(getValue() as string) === EquipmentGrade.Accessory ? "Accessory" : null}
            {parseInt(getValue() as string) === EquipmentGrade.Storage ? "Storage" : null}
          </>
        ),
      },

      {
        header: "Lab",
        accessorFn: (row) => row.room?.name ?? "",
        id: "roomName",
        cell: ({ getValue }) => <>{String(getValue() ?? "")}</>,
      },
    ];

    if (properties.length === 0 || !showEquipmentProperties) {
      baseColumns.push(...nonPropertiesColumns);
    } else {
      const renderPropertiesColumns: ColumnDef<Equipment>[] = properties.map((prop) => {
        const customAccessorFn = (row: Equipment) => {
          if (prop.type === "int") {
            return row.properties?.find((property) => property.property == prop.property)?.int_value ?? 0;
          }

          if (prop.type === "float") {
            return row.properties?.find((property) => property.property == prop.property)?.float_value ?? 0;
          }

          return row.properties?.find((property) => property.property == prop.property)?.value ?? "";
        };

        return {
          header: prop.label,
          id: `property-${prop.property}`,
          accessorFn: (row) => customAccessorFn(row),
          cell: ({ row }) => {
            const equipment = row.original;
            const propertyValue = equipment.properties?.find((property) => property.property == prop.property) ?? null;
            return (
              <>
                {prop.type === "int"
                  ? propertyValue?.int_value
                  : prop.type === "float"
                    ? propertyValue?.float_value
                    : (propertyValue?.value ?? "")}
              </>
            );
          },
        };
      });
      baseColumns.push(...renderPropertiesColumns);
    }

    return baseColumns;
  }, [environment, addDisabled, addEquipment, showEquipmentProperties, properties]);

  const table = useReactTable({
    columns,
    data: equipmentList,
    debugTable: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    state: {
      sorting,
    },
  });

  const onCloseEditSortingPropertiesModal = () => {
    setShowEditSortingPropertiesModal(false);
  };

  return (
    <>
      {showEquipmentProperties && (
        <Button
          variant="primary"
          className="mt-2"
          onClick={() => setShowEditSortingPropertiesModal(!showEditSortingPropertiesModal)}
        >
          Edit sorting properties <i className="fa fa-table"></i>
        </Button>
      )}
      <Table striped hover size="sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        style={header.column.getCanSort() ? { cursor: "pointer" } : {}}
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === "asc"
                              ? "Sort ascending"
                              : header.column.getNextSortingOrder() === "desc"
                                ? "Sort descending"
                                : "Clear sort"
                            : undefined
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}{" "}
                        {{
                          asc: <i className="fa fa-sort-asc"></i>,
                          desc: <i className="fa fa-sort-desc"></i>,
                        }[header.column.getIsSorted() as string] ??
                          (header.column.getCanSort() && <i className="fa fa-sort" aria-hidden="true"></i>)}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <EditSortingPropertiesModal
        show={showEditSortingPropertiesModal}
        onClose={onCloseEditSortingPropertiesModal}
        blacklistedEquipmentProperties={blacklistedEquipmentProperties}
        setBlacklistedEquipmentProperties={setBlacklistedEquipmentProperties}
        properties={Array.from(
          new Map(
            equipmentList
              .flatMap((eq) =>
                (eq.properties ?? []).map((prop) => ({
                  value: prop.property,
                  label: prop.label,
                }))
              )
              .map((p) => [p.value, p])
          ).values()
        )}
      />
    </>
  );
}
