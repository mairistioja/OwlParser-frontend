import Sidebar from "./Sidebar";
import Content from "./Content";

const ContentWrapper = ({ model, onClose }) => {
  return (
    <div className="wrapper">
      <Sidebar model={model} />
      <Content model={model} onClose={onClose} />
    </div>
  );
};

export default ContentWrapper;
