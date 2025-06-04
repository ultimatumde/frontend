import "./wallpaper.css";
import wallpaper from "../assets/wallpaper.jpg";

const Wallpaper = () => {
  return (
    <div className="wallbg">
      <img src={wallpaper} className="wallpaper" />
    </div>
  );
};

export default Wallpaper;
