import React, { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { clearSearchResults, fetchSearchTasks } from "../../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchTaskList from "../task/SearchTaskList";
import usePopup from "../../hooks/usePopup";
import { motion } from "framer-motion";

function SearchField({ handleSearchToggle, isSearchOpen, className, alwaysOpen = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { searchResults, selectedTask } = useSelector((state) => state.tasks);
  const { isAuthenticated } = useSelector((state) => state.user);

  const {
    handleIsCreate,
    handleTaskClick,
    handleCompletedTask,
    handleRemovedTask,
  } = usePopup();
  const dispatch = useDispatch();

  // useRef.current keeps a single debounced fn across renders (recreating it
  // each render defeated debouncing). dispatch is stable, so capturing it once
  // is safe. >50 chars: no-op; empty: clear only; 1–50: search.
  const debounceSearch = useRef(
    debounce((term) => {
      if (!term) {
        dispatch(clearSearchResults());
      } else if (term.length <= 50) {
        dispatch(fetchSearchTasks(term));
      }
    }, 500)
  ).current;

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
    debounceSearch(value);
  };

  const handleSearchTaskClick = (task) => {
    handleSearchToggle();
    setTimeout(() => {
      handleTaskClick(task);
    }, 100);
  };

  useEffect(() => {
    return () => {
      debounceSearch.cancel();
      dispatch(clearSearchResults());
    };
  }, [dispatch, debounceSearch]);

  return (
    <>
      {isAuthenticated ? (
        <div className="relative">
         
      
            <button>
              <FontAwesomeIcon
                icon={faSearch}
                onClick={handleSearchToggle}
                className={`z-30 absolute top-2.5 hover:text-purpleBorder text-xl text-gray-400 cursor-pointer transition-transform duration-300 ${
                  isSearchOpen ? "translate-x-[-200%] left-16" : "translate-x-0 -left-2"
                }`}
              />
            </button>
        

          {/* ถ้า alwaysOpen = true ใช้ input ธรรมดา, ถ้าไม่ใช้ motion.input */}
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

