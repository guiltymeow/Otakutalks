"use client"
import { useState } from "react";
import { FaChevronDown, FaBolt, FaCommentDots, FaUser, FaMusic, FaQuestionCircle, FaFilm, FaTags, FaDragon } from "react-icons/fa";

const TopicPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewHotOpen, setIsNewHotOpen] = useState(false);

  return (
    <div>
      <h2 
        className="text-[16px] font-regular cursor-pointer flex justify-between items-center p-2 hover:bg-gray-200 rounded-md opacity-50" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">TOPICS</span> 
        <FaChevronDown className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
      </h2>
      
      {isOpen && (
        <ul className="pl-4 mt-2 space-y-1">
          {/* New & Hot Section */}
          <li 
            className="text-[16px] cursor-pointer flex justify-between items-center p-2 hover:bg-gray-200 rounded-md" 
            onClick={() => setIsNewHotOpen(!isNewHotOpen)}
          >
            <span className="flex items-center gap-2">
              <FaBolt /> New & Hot
            </span>
            <FaChevronDown className={`transition-transform ${isNewHotOpen ? "rotate-180" : "rotate-0"}`} />
          </li>
          
          {isNewHotOpen && (
            <ul className="pl-6 mt-2 space-y-1">
              <li className="text-[16px] cursor-pointer p-2 hover:bg-gray-100 rounded-md">News</li>
              <li className="text-[16px] cursor-pointer p-2 hover:bg-gray-100 rounded-md">Meme</li>
              <li className="text-[16px] cursor-pointer p-2 hover:bg-gray-100 rounded-md">Interesting</li>
              <li className="text-[16px] cursor-pointer p-2 hover:bg-gray-100 rounded-md">Animals</li>
              <li className="text-[16px] cursor-pointer p-2 hover:bg-gray-100 rounded-md">Pets</li>
              <li className="text-[16px] cursor-pointer p-2 hover:bg-gray-100 rounded-md">Funny</li>
              <li className="text-[16px] cursor-pointer p-2 hover:bg-gray-100 rounded-md">Art</li>
              <li className="text-[16px] cursor-pointer p-2 hover:bg-gray-100 rounded-md">Cringe</li>
            </ul>
          )}

          {/* Other Topics */}
          <li className="text-[16px] cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
            <FaCommentDots /> Top Comments
          </li>
          <li className="text-[16px] cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
            <FaUser /> Characters
          </li>
          <li className="text-[16px] cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
            <FaMusic /> Music
          </li>
          <li className="text-[16px] cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
            <FaQuestionCircle /> Q&As
          </li>
          <li className="text-[16px] cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
            <FaFilm /> Movies
          </li>
          <li className="text-[16px] cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
            <FaTags /> Topics
          </li>
          <li className="text-[16px] cursor-pointer flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md">
            <FaDragon /> Anime
          </li>
        </ul>
      )}
    </div>
  );
};

export default TopicPanel;
