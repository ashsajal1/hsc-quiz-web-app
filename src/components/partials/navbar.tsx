import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { CiMenuFries } from "react-icons/ci";
import Text from "../custom-ui/text";
import SideNav from "./side-nav";
import { ModeToggle } from "../mode-toggle";
import { Button } from "../ui/button";
import { useSpeakerStore } from "@/store/useSpeakerStore";

export default function Navbar() {
  const [scrollY, setScrollY] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const { stop } = useSpeakerStore();
  return (
    <>
      <SideNav handleClose={toggleOpen} isOpen={isOpen} />
      <nav
        className={`flex items-center justify-between p-2 w-full h-[80px] top-0 bg-white md:dark:border-none border-b dark:bg-black dark:border-b-gray-800 z-10 fixed ${
          scrollY > 150 ? "bg-opacity-60 dark:bg-opacity-60 backdrop-blur" : ""
        }`}
        onClick={handleNavClick}
      >
        <Link to="/">
          <Text label="HSC Quiz" className="text-xl font-bold" />
        </Link>

        <div className="flex items-center gap-2">
          <Link to={"/saved"}>
            <Button variant={"link"}>Saved</Button>
          </Link>
          <Link to={"/exam"}>
            <Button>Exam</Button>
          </Link>
          <ModeToggle />

          <CiMenuFries
            onClick={() => {
              toggleOpen();
              stop();
            }}
            className="h-6 w-6 md:hidden dark:text-white text-black"
          />

          {/* <div className="hidden md:flex items-center gap-2">
            <Search />
            <Link to='/login'><Button>Login</Button></Link>
          </div> */}
        </div>
      </nav>
    </>
  );
}
