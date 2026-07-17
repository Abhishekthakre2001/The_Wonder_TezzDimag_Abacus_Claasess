// import { Navigate } from "react-router-dom";
// import { getAuth } from "../utils/auth";

// const RoleProtectedRoute = ({ children, allowedRoles }) => {
//   const { token, user } = getAuth();

//   if (!token || !user) {
//     return <Navigate to="/" replace />;
//   }

//   if (!allowedRoles.includes(user.usertype)) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default RoleProtectedRoute;


import { Navigate } from "react-router-dom";
import { getAuth } from "../utils/auth";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = getAuth();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.map(r => r.toLowerCase()).includes(user.usertype.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;