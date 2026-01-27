export default function AbsoluteCinema() {
    const videoId = "OUnNZUXO-aI";

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Video Container */}
            <div className="relative w-full h-screen mx-auto aspect-video overflow-hidden shadow-lg">
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&mute=1&controls=0&playlist=${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}