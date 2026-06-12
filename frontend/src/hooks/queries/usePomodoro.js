import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axios from "axios";
import { applyPetReward } from "../../redux/petSlice";

const completePomodoro = async () => {
  const res = await axios.post("/pet/pomodoro");
  return res.data;
};

export function usePomodoroSession() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: completePomodoro,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pet"] });
      if (data?.awardedExp !== undefined) {
        dispatch(applyPetReward(data));
      }
    },
  });
}
