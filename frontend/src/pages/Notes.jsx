import React from "react";
import { Progress, Subjects, PyqSection } from "../components/index.components";
import Sidebar from "../components/Sidebar";

function Notes() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-[120px]">
        <div className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col gap-6">
          <Progress />
          <Subjects />
          <PyqSection />
        </div>
      </div>
    </div>
  );
}

export default Notes;
