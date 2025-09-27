import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const {logout} = useAuth();

  return (
    <div className="absolute top-4 right-4">
      <Button
        variant="outline"
        onClick= {logout}
        className="px-6 md:px-4 py-4 md:py-2 bg-black text-white"
      >
        Logout
      </Button>
    </div>
  );
}
