import BookGrid from '../components/menu/BookGrid';
import Menu from '../components/menu/Menu';
import SearchBar from '../components/SearchBa';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <SearchBar />

                    <BookGrid />

                    <Menu />
                </div>
            </div>
        </div>
    );
}