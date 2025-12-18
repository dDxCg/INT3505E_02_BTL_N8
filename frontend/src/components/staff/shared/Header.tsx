import { FaSearch, FaUserCircle, FaBell } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import logoImage from "../../../assets/images/logo.png";

interface HeaderProps {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  userName = "Test",
  userRole = "Role",
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // TODO: Implement actual logout logic
    console.log("Logout clicked");
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a]">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
        <img src={logoImage} className="h-8 w-8" alt="restro logo" />
        <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">
          Restro
        </h1>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-5 py-2 w-[500px]">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Search"
          className="bg-[#1f1f1f] outline-none text-[#f5f5f5] w-full"
        />
      </div>

      {/* LOGGED USER DETAILS */}
      <div className="flex items-center gap-4">
        {userRole === "Admin" && (
          <div onClick={() => navigate("/staff/dashboard")} className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
            <MdDashboard className="text-[#f5f5f5] text-2xl" />
          </div>
        )}
        <div className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
          <FaBell className="text-[#f5f5f5] text-2xl" />
        </div>
        <div className="flex items-center gap-3 cursor-pointer">
          <FaUserCircle className="text-[#f5f5f5] text-4xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
              {userName}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {userRole}
            </p>
          </div>
          <IoLogOut
            onClick={handleLogout}
            className="text-[#f5f5f5] ml-2 cursor-pointer"
            size={35}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
