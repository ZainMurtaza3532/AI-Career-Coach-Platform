import React from "react";

const MainLayout = async ({ children }) => {
  return <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-20">{children}</div>;
};

export default MainLayout;
