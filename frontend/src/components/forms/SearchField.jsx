import { useState } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchTaskList from "../task/SearchTaskList";
import usePopup from "../../hooks/usePopup";
import { motion } from "framer-motion";
import { useSearchTasksQuery } from "../../hooks/queries/useTasks";

function SearchField({ handleSearchToggle, isSearchOpen, className, alwaysOpen = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedTask } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.user);
  const { data: searchResults = [] } = useSearchTasksQuery(searchTerm);

  const {
    handleIsCreate,
    handleTaskClick,
    handleCompletedTask,
    handleRemovedTask,
  } = usePopup();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTaskClick = (task) => {
    handleSearchToggle();
    setTimeout(() => {
      handleTaskClick(task);
    }, 100);
  };

  return (
    <>
      {isAuthenticated ? (
        <div className="relative">
          {!alwaysOpen && (
            <button>
              <FontAwesomeIcon
                icon={faSearch}
                onClick={handleSearchToggle}
                className={`z-30 absolute top-2.5 hover:text-purpleBorder text-xl text-gray-400 cursor-pointer transition-transform duration-300 ${
                  isSearchOpen ? "translate-x-[-200%] left-16" : "translate-x-0 -left-2"
                }`}
              />
            </button>
          )}

          {alwaysOpen ? (
            <input
              type="text"
              placeholder="Search task here !"
              value={searchTerm}
              onChange={handleSearch}
              className={className}
            />
          ) : (
            <motion.input
              type="text"
              placeholder="Search task here !"
              value={searchTerm}
              onChange={handleSearch}
              className={className}
              animate={{
                width: isSearchOpen ? 260 : 0,
                opacity: isSearchOpen ? 1 : 0,
              }}
              transition={{
                duration: 0.2,
                type: "keyframes",
                ease: "easeInOut",
              }}
              initial={false}
            />
          )}

          <div>
            {Array.isArray(searchResults) && searchResults.length > 0 && (
              <div className="absolute top-full -right-5 mt-3 w-[300px] p-0.5 bg-purpleNormal shadow-lg rounded-xl z-50">
                <div className="bg-darkBackground rounded-xl">
                  <SearchTaskList
                    allTasks={searchResults}
                    handleCompletedTask={handleCompletedTask}
                    handleRemovedTask={handleRemovedTask}
                    handleTaskClick={handleTaskClick}
                    handleSearchTaskClick={handleSearchTaskClick}
                    handleIsCreate={handleIsCreate}
                    selectedTask={selectedTask}
                  />
                </div>
              </div>
            )}
            {searchTerm && searchResults.length === 0 && (
              <div className="absolute top-full -right-5 mt-3 w-[300px] border-2 border-purpleNormal bg-darkBackground text-center text-xl py-4 text-white shadow-lg rounded-md z-50">
                No tasks found
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default SearchField;
