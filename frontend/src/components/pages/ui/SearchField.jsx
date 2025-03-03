import React, { useState, useEffect , Suspense} from "react";
import { debounce } from "lodash";
import InputField from "./inputField";
import { useDispatch, useSelector } from "react-redux";
import { clearSearchResults, fetchSearchTasks } from "../../../redux/taskSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch} from "@fortawesome/free-solid-svg-icons";
import SearchTaskList from "./SearchTaskList";
import usePopup from "../hooks/usePopup";

 const TaskDetail = React.lazy(() =>  import("../ui/taskDetail"))

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

  return (
    <div className=" relative">
      <InputField
        type="text"
        placeholder="Search your task here"
        id="search"
        name="search"
        value={searchTerm}
        onChange={handleSearch}
        className="w-auto rounded-xl  p-2 pl-10 text-xl"
      />
      <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
      <div>
        {Array.isArray(searchResults) && searchResults.length > 0 && (
          <div className="absolute top-full -right-5 mt-2 w-[300px] p-0.5 bg-purpleGradient  shadow-lg rounded-2xl z-50">
            <div className="bg-darkBackground rounded-2xl">
              <SearchTaskList
                allTasks={searchResults}
                handleCompletedTask={handleCompletedTask}
                handleRemovedTask={handleRemovedTask}
                handleTaskClick={handleTaskClick}
                handleIsCreate={handleIsCreate}
                selectedTask={selectedTask}
              />
            </div>
          </div>
        )}
        {searchTerm && searchResults.length === 0 && (
          <div className="absolute top-full -right-5 mt-2 w-[300px] bg-purpleMain text-center text-xl py-4 text-white shadow-lg rounded-md z-50">
            No tasks found
          </div>
        )}
        {selectedTask && (
          <div className="popup-overlay z-50">
            <div className="popup-content">
              <Suspense fallback={<></>}>
                <TaskDetail onClose={handleCloseDetail} />
              </Suspense>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchField;
