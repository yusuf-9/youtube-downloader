// modules
import Hero from "@/common/components/hero";

// common
import VideoDownloadModule from "@/modules/video-download";

export default function Home() {
  return (
    <section className="flex flex-col flex-grow bg-theme-dark p-10">
      <div className="mx-auto flex flex-col flex-grow gap-5 w-full md:w-4/5 lg:w-4/6 xl:w-3/6">
        <Hero
          highlightedTitle="Youtube Video"
          description="Try this unique tool for quick, hassle-free downloads from YouTube. transform your offline video collections with this reliable and efficient downloader"
          warningText="we do not allow/support the download of copyrighted material!"
        />
        <VideoDownloadModule />
      </div>
    </section>
  );
}
