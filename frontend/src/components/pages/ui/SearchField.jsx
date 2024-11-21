import React, { useState, useEffect } from "react";
import { debounce } from "lodash";
import InputField from "./inputField";
import { useDispatch, useSelector } from "react-redux";
import { clearSearchResults, fetchSearchTasks } from "../../../redux/taskSlice";
import SearchTaskList from "./SearchTaskList";
import TaskDetail from "./taskDetail";
import usePopup from "../hooks/usePopup";

function SearchField() {
  const [searchTerm, setSearchTerm] = useState("");
  const { searchResults, selectedTask } = useSelector((state) => state.tasks);
  const {
    handleIsCreate,
    handleCloseDetail,
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

  useEffect(() => {
    return () => {
      debounceSearch.cancel();
      dispatch(clearSearchResults());
    };
  }, [dispatch]);
  console.log("search term:", searchTerm);
  console.log("search result:", searchResults);

  return (
    <div className="w-[300px] relative">
      <InputField
        type="text"
        placeholder="Search your task here"
        id="search"
        name="search"
        value={searchTerm}
        onChange={handleSearch}
        className="w-full p-2 text-xl"
      />
      <div>
        {Array.isArray(searchResults) && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-[300px] bg-purpleActiveTop shadow-lg rounded-2xl ">
            <SearchTaskList
              allTasks={searchResults}
              handleCompletedTask={handleCompletedTask}
              handleRemovedTask={handleRemovedTask}
              handleTaskClick={handleTaskClick}
              handleIsCreate={handleIsCreate}
              selectedTask={selectedTask}
            />
          </div>
        )}
        {searchTerm && searchResults.length === 0 && (
          <div className="absolute top-full mt-2 w-[300px] bg-purpleMain text-center py-4 text-white shadow-lg rounded-md z-50">
            No tasks found
          </div>
        )}
        {selectedTask && (
          <div className="popup-overlay z-50">
            <div className="popup-content">
              <TaskDetail onClose={handleCloseDetail} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchField;
