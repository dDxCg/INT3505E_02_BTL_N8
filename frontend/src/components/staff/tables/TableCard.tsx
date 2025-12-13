import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../../utils/staffUtils";
import { FaLongArrowAltRight } from "react-icons/fa";

interface TableCardProps {
  id: number;
  name: string;
  status: "Occupied" | "Available";
  initials?: string;
  seats: number;
}

const TableCard: React.FC<TableCardProps> = ({ id, name, status, initials, seats }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to POS with table data
    navigate(`/staff/pos`, {
      state: {
        tableId: id,
        tableNo: name,
        seats: seats,
        status: status
      }
    });
  };

  return (
    <div
      onClick={handleClick}
      key={id}
      className="w-[300px] hover:bg-[#2c2c2c] bg-[#262626] p-4 rounded-lg cursor-pointer"
    >
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-xl font-semibold">
          Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {name}
        </h1>
        <p
          className={`${
            status === "Occupied" ? "text-green-600 bg-[#2e4a40]" : "bg-[#664a04] text-white"
          } px-2 py-1 rounded-lg`}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center mt-5 mb-8">
        <h1
          className={`text-white rounded-full p-5 text-xl`}
          style={{ backgroundColor: initials ? getBgColor() : "#1f1f1f" }}
        >
          {getAvatarName(initials) || "N/A"}
        </h1>
      </div>
      <p className="text-[#ababab] text-xs">
        Seats: <span className="text-[#f5f5f5]">{seats}</span>
      </p>
    </div>
  );
};

export default TableCard;
