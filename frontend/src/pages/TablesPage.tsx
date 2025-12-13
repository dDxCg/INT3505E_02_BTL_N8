import { useState, useEffect } from "react";
import BackButton from "../components/staff/shared/BackButton";
import TableCard from "../components/staff/tables/TableCard";
import { useTables } from "../hooks/useApi";
import { getAvatarName } from "../utils/staffUtils";

const TablesPage: React.FC = () => {
  const [status, setStatus] = useState("all");

  // Fetch tables from API
  const { data: tables, isLoading, error } = useTables();

  useEffect(() => {
    document.title = "POS | Tables";
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex items-center justify-center">
        <div className="text-[#f5f5f5] text-xl">Loading tables...</div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden flex items-center justify-center">
        <div className="text-red-500 text-xl">
          Error loading tables. Please try again.
        </div>
      </section>
    );
  }

  // Filter tables based on status
  const filteredTables = tables?.filter((table) => {
    if (status === "all") return true;
    // Backend returns status_id: 1 = available, 2 = occupied
    if (status === "occupied") {
      return table.status_id === 2;
    }
    return true;
  }) || [];

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden">
      <div className="flex items-center justify-between px-10 py-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-[#f5f5f5] text-2xl font-bold tracking-wider">
            Tables
          </h1>
        </div>
        <div className="flex items-center justify-around gap-4">
          <button
            onClick={() => setStatus("all")}
            className={`text-[#ababab] text-lg ${
              status === "all" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            All
          </button>
          <button
            onClick={() => setStatus("occupied")}
            className={`text-[#ababab] text-lg ${
              status === "occupied" && "bg-[#383838] rounded-lg px-5 py-2"
            }  rounded-lg px-5 py-2 font-semibold`}
          >
            Occupied
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 px-16 py-4 h-[650px] overflow-y-scroll scrollbar-hide">
        {filteredTables.length === 0 ? (
          <div className="col-span-5 flex items-center justify-center text-[#ababab] text-lg">
            No tables found
          </div>
        ) : (
          filteredTables.map((table) => {
            // Map API data to TableCard format
            const tableName = table.number?.toString() || `Table ${table.id}`;
            const tableStatus = table.status_id === 2 ? "Occupied" : "Available";
            const initials = getAvatarName(tableName);

            return (
              <TableCard
                key={table.id}
                id={table.id}
                name={tableName}
                status={tableStatus}
                initials={initials}
                seats={table.seats}
              />
            );
          })
        )}
      </div>
    </section>
  );
};

export default TablesPage;
