import { useNavigate } from "react-router-dom";
import { getAvatarName, getBgColor } from "../../../utils/staffUtils";
import { FaLongArrowAltRight } from "react-icons/fa";

interface TableCardProps {
  id: number;
  name: string;
  status: "Serving" | "Available";
  initials?: string;
  seats: number;
}

const TableCard: React.FC<TableCardProps> = ({ id, name, status, initials, seats }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to table detail page
    navigate(`/staff/table/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      key={id}
      className="w-full h-[200px] hover:bg-[#2c2c2c] bg-[#262626] p-4 rounded-lg cursor-pointer transition-colors flex flex-col"
    >
      <div className="flex items-center justify-between px-1 mb-4">
        <h1 className="text-[#f5f5f5] text-xl font-semibold">
          Table <FaLongArrowAltRight className="text-[#ababab] ml-2 inline" /> {name}
        </h1>
        <p
          className={`${
            status === "Available" ? "text-green-600 bg-[#2e4a40]" : "bg-[#664a04] text-white"
          } px-2 py-1 rounded-lg text-sm`}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center flex-1">
        <h1
          className={`text-white rounded-4xl p-5 text-xl`}
          style={{ backgroundColor: initials ? getBgColor() : "#1f1f1f" }}
        >
          { "T-" + getAvatarName(initials) || "N/A"}
        </h1>
      </div>
      <p className="text-[#ababab] text-xs mt-4">
        Seats: <span className="text-[#f5f5f5]">{seats}</span>
      </p>
    </div>
  );
};

export default TableCard;
