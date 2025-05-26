import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "../context/AuthContext";


export default function AuthLayout() {
  const { isAuthenticated } = useUserContext();

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <Outlet />
          </section>

          <img
            src="/assets/images/side-img.svg"
            alt="logo"
            className="hidden xl:block w-1/2 h-screen object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  );
}