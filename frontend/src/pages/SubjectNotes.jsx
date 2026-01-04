import React from "react";
import {
  SingleNotes,
} from "../components/index.components";
import Sidebar from "../components/Sidebar";

function SubjectNotes() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 transition-all duration-300 ml-0 md:ml-[120px] pt-16 md:pt-0">
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
