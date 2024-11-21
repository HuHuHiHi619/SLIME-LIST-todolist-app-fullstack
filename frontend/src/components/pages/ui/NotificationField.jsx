import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotification } from "../../../redux/summarySlice";

function NotificationField() {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.summary);
  console.log("noti", notification);
  useEffect(() => {
    dispatch(fetchNotification());
  }, [dispatch]);
  return (
    <div className="relative">
      <div className="absolute top-12 -right-12 mt-2 w-[300px] bg-purpleActiveTop shadow-lg rounded-2xl p-4">
        {notification && notification.length > 0 ? (
          notification.map((noti, index) => (
            <div key={index} className="">
              <h3>{noti.type}</h3>
              <h3>{noti.message}</h3>
            </div>
          ))
        ) : (
          <h3>No message</h3>
        )}
      </div>
    </div>
  );
}

export default NotificationField;
