"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Loader from "../components/Loader";
import { logout } from "@/service/auth.service";
import { getAllUsers } from "@/service/user.service";
import useSidebarStore from "@/store/sidebarStore";
import userStore from "@/store/userStore";
import { Bell, Home, LogOut, Menu, MessageCircle, Search, Users, Video } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Header = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userList, setUserList] = useState([]);
    const [filterUsers, setFilterUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("home");
    const searchRef = useRef(null);
    const { toggleSidebar } = useSidebarStore();
    const router = useRouter();
    const { user, clearUser } = userStore();

    const userPlaceholder = user?.username?.split(" ").map(name => name[0]).join("");

    const handleNavigation = (path, item) => {
        router.push(path);
        setActiveTab(item);
    };

    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result?.status === "success") {
                router.push("/user-login");
                clearUser();
                toast.success("User logged out successfully");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to log out");
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const result = await getAllUsers();
                setUserList(result);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filterUser = userList.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()));
            setFilterUsers(filterUser);
            setIsSearchOpen(true);
        } else {
            setFilterUsers([]);
            setIsSearchOpen(false);
        }
    }, [searchQuery, userList]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setIsSearchOpen(false);
    };

    const handleUserClick = async (userId) => {
        setLoading(true);
        setIsSearchOpen(false);
        setSearchQuery("");
        await router.push(`user-profile/${userId}`);
        setLoading(false);
    };

    const handleSearchClose = (e) => {
        if (!searchRef.current?.contains(e.target)) {
            setIsSearchOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleSearchClose);
        return () => {
            document.removeEventListener("click", handleSearchClose);
        };
    }, []);

    if (loading) return <Loader />;

    return (
        <header className="bg-white dark:bg-[#292929] text-foreground shadow-md h-16 fixed top-0 left-0 right-0 z-50 p-2">
            <div className="mx-auto flex justify-between items-center h-full px-2 sm:px-4">
                {/* Logo Section */}
                <div className="flex items-center gap-1 sm:gap-2">
                 
                    <span className="text-md sm:text-lg font-bold text-[#42bc5c]">LinkUp</span>
                </div>
                
                {/* Search Bar */}
                <div className="relative hidden md:block" ref={searchRef}>
                    <form onSubmit={handleSearchSubmit}>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                className="pl-8 w-48 sm:w-64 h-8 sm:h-10 bg-gray-100 dark:bg-[rgb(58,59,60)] rounded-full"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchOpen(true)}
                            />
                        </div>
                        {isSearchOpen && (
                            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg mt-1 z-50">
                                <div className="p-2">
                                    {filterUsers.length > 0 ? (
                                        filterUsers.map(user => (
                                            <div
                                                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                                                key={user._id}
                                                onClick={() => handleUserClick(user._id)}
                                            >
                                                <Avatar className="h-8 w-8">
                                                    {user?.profilePicture ? (
                                                        <AvatarImage
                                                            src={user?.profilePicture}
                                                            alt={user?.username}
                                                        />
                                                    ) : (
                                                        <AvatarFallback>{userPlaceholder}</AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <span>{user?.username}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-gray-500">No user found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Hamburger Menu for Mobile */}
<div className="block md:hidden">
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-between items-center p-2">
                <Menu />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 sm:w-64 z-50" align="start">
            {/* User Info */}
            <DropdownMenuLabel className="font-normal">
                <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                        {user?.profilePicture ? (
                            <AvatarImage src={user?.profilePicture} alt={user?.username} />
                        ) : (
                            <AvatarFallback>{userPlaceholder}</AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                        <p className="text-xs mt-2 text-gray-600 leading-none">{user?.email}</p>
                    </div>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Navigation Options */}
            {[
                { icon: Home, path: "/", name: "Home" },
                { icon: Video, path: "/video-feed", name: "Video" },
                { icon: Users, path: "/friends-list", name: "Friends" },
                { icon: Users, path: `/user-profile/${user?._id}`, name: "Profile" },
                { icon: LogOut, action: handleLogout, name: "Logout" }
            ].map(({ icon: Icon, path, action, name }, idx) => (
                <DropdownMenuItem
                    key={name}
                    onClick={() => (action ? action() : handleNavigation(path))}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                >
                    <Icon className="mr-2 text-gray-600" /> <span>{name}</span>
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
</div>


                {/* Navigation for larger screens */}
                <div className="hidden md:flex justify-around w-[40%] sm:w-[50%] max-w-lg">
                    {[
                        { icon: Home, path: "/", name: "home" },
                        { icon: Video, path: "/video-feed", name: "video" },
                        { icon: Users, path: "/friends-list", name: "friends" },
                    ].map(({ icon: Icon, path, name }) => (
                        <Button
                            key={name}
                            variant="ghost"
                            size="icon"
                            className={`relative text-gray-600 dark:text-gray-400 hover:text-[#42bc5c] hover:bg-transparent p-2 sm:p-3 ${activeTab === name ? "text-[#42bc5c]" : ""}`}
                            onClick={() => handleNavigation(path, name)}
                        >
                            <Icon />
                        </Button>
                    ))}
                </div>

                {/* User Profile Avatar for larger screens */}
                <div className="hidden md:flex space-x-1 sm:space-x-2 items-center">
                    <Button variant="ghost" size="icon" className="text-gray-600 p-2 sm:p-3">
                        <Bell />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-600 p-2 sm:p-3">
                        <MessageCircle />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full flex justify-between items-center">
                            <Avatar className="h-8 w-8 mr-2">
                                        {user?.profilePicture ? (
                                            <AvatarImage
                                                src={user?.profilePicture}
                                                alt={user?.username}
                                            />
                                        ) : (
                                            <AvatarFallback>{userPlaceholder}</AvatarFallback>
                                        )}
                                    </Avatar>
                               




                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48 sm:w-64 z-50" align="start">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex items-center">
                                    <Avatar className="h-8 w-8 mr-2">
                                        {user?.profilePicture ? (
                                            <AvatarImage
                                                src={user?.profilePicture}
                                                alt={user?.username}
                                            />
                                        ) : (
                                            <AvatarFallback>{userPlaceholder}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">{user?.username}</p>
                                        <p className="text-xs mt-2 text-gray-600 leading-none">{user?.email}</p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleNavigation(`/user-profile/${user?._id}`)}>
                                <Users /> <span className="ml-2">Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut /> <span className="ml-2">Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Header;
