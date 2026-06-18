import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import ReactDOM from "react-dom";
import FadeUpContainer from "../animation/FadeUpContainer";
import AuthTabs from "../auth/AuthTabs";
import SearchField from "../forms/SearchField";
import AvatarMenu from "./AvatarMenu";
import usePopup from "../../hooks/usePopup";

const NAV_LINKS = [
  { label: "Dashboard", to: "/", exact: true },
  { label: "Tasks", to: "/all-tasks", match: ["/all-tasks", "/upcoming", "/category"] },
  { label: "Focus", to: "/pomodoro", match: ["/pomodoro"] },
];

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
      style={
        active
          ? { background: "var(--violet)", color: "#fff" }
          : { color: "var(--slime-muted)" }
      }
    >
      {label}
    </Link>
  );
}

function Navbar() {
  const { isAuthenticated, loading, isRegisterPopup } = useSelector(
    (state) => state.user
  );
  const location = useLocation();
  const { handleToggleRegister, popupRegisterRef } = usePopup();

  const isActive = (link) => {
    if (link.exact) return location.pathname === link.to;
    return link.match?.some((p) => location.pathname.startsWith(p)) ?? false;
  };

  return (
    <>
      <div id="nav-bar">
        {/* Left — logo */}
        <Link to="/" className="flex items-center gap-3 pl-6">
          <img src="./images/Logo-slime.png" className="w-7" alt="Slime List" />
          <p className="text-2xl font-bold bg-purpleGradient bg-clip-text text-transparent hidden sm:block">
            SLIME LIST
          </p>
        </Link>

        {/* Center — nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} {...link} active={isActive(link)} />
          ))}
        </nav>

        {/* Right — search + avatar/auth */}
        <div className="flex items-center gap-3 pr-6 justify-end">
          {isAuthenticated && (
            <div className="hidden lg:block">
              <SearchField
                alwaysOpen
                isSearchOpen
                handleSearchToggle={() => {}}
                className="rounded-xl px-4 py-1.5 text-sm text-white focus-visible:outline-2 outline-purpleBorder bg-purpleMain border border-purpleNormal w-48 placeholder:text-gray-500"
              />
            </div>
          )}

          {isAuthenticated ? (
            <AvatarMenu />
          ) : (
            <button
              className="register"
              onClick={() => !loading && handleToggleRegister()}
              disabled={loading}
            >
              Sign up
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated && isRegisterPopup &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup-content">
              <FadeUpContainer direction="top">
                <AuthTabs ref={popupRegisterRef} />
              </FadeUpContainer>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Navbar;
