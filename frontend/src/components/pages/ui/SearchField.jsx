import React, { useState, useEffect } from "react";
import { debounce } from "lodash";
import InputField from "./inputField";
import { useDispatch, useSelector } from "react-redux";
import { clearSearchResults, fetchSearchTasks } from "../../../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import SearchTaskList from "./SearchTaskList";
import usePopup from "../hooks/usePopup";
import { motion } from "framer-motion";

function SearchField({ handleSearchToggle, isSearchOpen }) {
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

  const debounceSearch = debounce((term) => {
    if (!term) {
      dispatch(clearSearchResults());
    }
    if (term.length > 100) {
      return;
    } else if (term.length < 100) {
      dispatch(fetchSearchTasks(term));
    }
  }, 500);

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
  }, [dispatch]);

  return (
    <>
      {isAuthenticated ? (
        <div className=" relative ">
          <button>
            <FontAwesomeIcon
              icon={faSearch}
              onClick={handleSearchToggle}
              className={`z-30 absolute top-3 hover:text-purpleBorder text-xl text-gray-400  cursor-pointer transition-transform duration-300 ${
                isSearchOpen ? "translate-x-[-200%] left-16" : "translate-x-0 -left-2"
              }`}
            />
          </button>
          <motion.input
            type="text"
            placeholder="Search task here !"
            value={searchTerm}
            onChange={handleSearch}
            className={`rounded-xl p-2 text-white focus-visible:outline-none ${
              isSearchOpen ? "pl-14" : ""
            } text-xl  z-20 bg-purpleNormal`}
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
         

          <div>
            {Array.isArray(searchResults) && searchResults.length > 0 && (
              <div className="absolute top-full -right-5 mt-3 w-[300px] p-0.5 bg-purpleNormal  shadow-lg rounded-xl z-50">
                <div className="bg-darkBackground rounded-xl pl-2">
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
