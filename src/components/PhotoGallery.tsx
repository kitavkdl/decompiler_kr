import endSeminar from "@/assets/end_seminar.jpeg";
import ideathon from "@/assets/ideathon.jpeg";
import groupStudy from "@/assets/group_study.jpeg";

const glass = "backdrop-blur-lg bg-background/25 border border-foreground/[0.06] rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

const photos = [
  { src: endSeminar, title: "End Semester Seminar", desc: "학기말 세미나 & 네트워킹" },
  { src: ideathon, title: "2025 Ideathon", desc: "SUNY Korea 최초 아이디어톤 개최" },
  { src: groupStudy, title: "Group Study", desc: "함께 배우고 성장하는 그룹 스터디" },
];

const PhotoGallery = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-4xl mx-auto">
      {photos.map((photo) => (
        <div
          key={photo.title}
          className={`${glass} group overflow-hidden p-0 hover:border-primary/30 transition-all duration-500`}
        >
          <div className="relative overflow-hidden">
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h4 className="font-display font-semibold text-foreground text-sm">{photo.title}</h4>
              <p className="text-muted-foreground text-xs mt-0.5">{photo.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGallery;
