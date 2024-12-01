import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotification } from "../../../redux/summarySlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

function NotificationField() {
  const dispatch = useDispatch();
  const { notification } = useSelector((state) => state.summary);
 
  useEffect(() => {
    dispatch(fetchNotification());
  }, [dispatch]);
  return (
    <div className="relative">
      <div className="absolute top-12 -right-12 mt-2  w-[300px] h-[300px]  bg-purpleMain rounded-2xl p-6 list-shadow">
      <h3 className="text-2xl">NOTIFICATIONS</h3>
        {notification && notification.length > 0 ? (
          notification.map((noti, index) => (
           <ul key={index} className="mt-3 hover:bg-purpleNormal p-2 rounded-xl">
              <div className="flex gap-2 items-center">
              <FontAwesomeIcon icon={faBolt} className="text-2xl text-amber-400" />
              <h3>{noti.message}</h3>
              </div>
           </ul>
          ))
        ) : (
          <h3>No message</h3>
        )}
      </div>
    </div>
  );
}

export default NotificationField;
