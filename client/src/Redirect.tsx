import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [to, navigate]);
  return null; // or a loading spinner if you prefer
}
