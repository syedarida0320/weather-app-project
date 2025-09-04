import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/store/forecastSlice";

export default function LogoutButton() {
  const dispatch = useDispatch();

  return (
    <div className="absolute top-4 right-4">
      <Button
        variant="outline"
        onClick={() => dispatch(logoutUser())}
        className="px-6 md:px-4 py-4 md:py-2 bg-black text-white"
      >
        Logout
      </Button>
    </div>
  );
}
