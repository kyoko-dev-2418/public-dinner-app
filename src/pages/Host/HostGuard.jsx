import { Navigate, Outlet, useParams } from "react-router-dom";

function HostGuard({ user }) {
  const { hostId } = useParams();

  if (!user) {
    return <Navigate to="/creator-signup" replace />;
  }

  if (user.uid.startsWith("guest_")) {
    return <Navigate to="/403" replace />;
  }

  if (user.uid !== hostId) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
export default HostGuard;