import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestion, faGear, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import FadeUpContainer from "../animation/FadeUpContainer";
import InstructionPopup from "../feedback/InstructionPopup";
import usePopup from "../../hooks/usePopup";
import { logoutUser } from "../../redux/userSlice";
import queryClient from "../../lib/queryClient";

function AvatarMenu() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);
  const { userData } = useSelector((state) => state.user);
  const { instruction } = useSelector((state) => state.ui);
  const { handleIsInstruct, popupInstructRef } = usePopup();

  const initial = userData?.username?.[0]?.toUpperCase() ?? "S";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.clear();
      queryClient.removeQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["summary"] });
      queryClient.removeQueries({ queryKey: ["summaryByCategory"] });
      queryClient.setQueryData(["user"], null);
    } catch {
      alert("Logout failed. Please try again.");
    }
  };

  const menuItem = "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 hover:opacity-80 text-left";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-200 hover:opacity-90 shadow-slime-purple"
        style={{ background: "var(--violet)" }}
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded-xl border py-1 z-50"
          style={{
            background: "var(--slime-pop)",
            borderColor: "var(--slime-bd)",
            boxShadow: "var(--slime-shadow)",
          }}
        >
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className={menuItem}
            style={{ color: "var(--slime-ink)" }}
          >
            <FontAwesomeIcon icon={faGear} className="w-4 h-4 opacity-60" />
            Settings
          </Link>
          <button
            onClick={() => { handleIsInstruct(); setOpen(false); }}
            className={menuItem}
            style={{ color: "var(--slime-ink)" }}
          >
            <FontAwesomeIcon icon={faQuestion} className="w-4 h-4 opacity-60" />
            Instructions
          </button>
          <div className="mx-3 my-1 border-t" style={{ borderColor: "var(--slime-bd)" }} />
          <button
            onClick={() => { setShowLogoutConfirm(true); setOpen(false); }}
            className={menuItem}
            style={{ color: "var(--danger)" }}
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      {showLogoutConfirm &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <FadeUpContainer>
              <div className="popup-content border-2 p-8 rounded-xl border-purpleNormal bg-purpleSidebar">
                <p className="text-2xl text-white text-center">
                  Are you sure you want to logout?
                </p>
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    className="transition-all duration-100 ease-in-out text-deadlineTheme border-deadlineTheme text-2xl border-2 p-2 px-4 rounded-xl hover:bg-deadlineTheme hover:text-white"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                  <button
                    className="transition-all duration-100 ease-in-out text-violet-400 border-violet-400 text-2xl border-2 p-2 px-4 rounded-xl hover:bg-violet-400 hover:text-white"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </FadeUpContainer>
          </div>,
          document.body
        )}

      {instruction &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div
              className="popup-content"
              ref={popupInstructRef}
              onClick={(e) => e.stopPropagation()}
            >
              <InstructionPopup onClose={handleIsInstruct} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default AvatarMenu;
