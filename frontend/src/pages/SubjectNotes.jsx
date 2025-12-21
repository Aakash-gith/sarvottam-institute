import React from "react";
import {
  SingleNotes,
} from "../components/index.components";
import Sidebar from "../components/Sidebar";

function SubjectNotes() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-300 ml-[120px]">
        <div className="pb-0 pr-0 rounded-lg gap-5 flex flex-col h-full">


          <div className="flex-1 overflow-y-auto">
            <SingleNotes />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubjectNotes;
