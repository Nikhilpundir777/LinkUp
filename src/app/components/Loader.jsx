import { LoaderCircle } from 'lucide-react';
const Loader = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoaderCircle size={44} strokeWidth={2.5} className="text-[#42bc5c]" />
        </div>
    );
};

export default Loader;